"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { canCustomerCancel } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Order, PaymentMethod } from "@/lib/types";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  ErrorState,
  Panel,
  Skeleton,
} from "@/components/ui/primitives";
import { ChoiceRow } from "@/components/ui/forms";
import { ConfirmDialog } from "@/components/ui/overlays";
import { Icon } from "@/components/ui/icons";
import { CheckoutSteps } from "./checkout-steps";
import { clockLabel, scaledMs, useCountdown, useDelayedStep } from "./checkout-hooks";
import {
  EMPTY_CARD,
  PaymentCardForm,
  maskCard,
  validateCard,
  type CardErrors,
  type CardFields,
} from "./payment-card-form";
import { PaymentProcessing } from "./payment-processing";
import { PaymentQrPanel, type QrState } from "./payment-qr-panel";
import { PaymentOrderSummary } from "./payment-summary";

type Phase = "select" | "processing" | "declined" | "delayed" | "duplicate" | "success";

const DUPLICATE_SENTENCE =
  "A payment for this order is already in progress — we will never charge you twice.";

const DECLINE_REASON = "Insufficient funds (bank response code 51)";

/** DuitNow dynamic QR codes are valid for 10 minutes. */
const QR_SECONDS = 600;

interface Runners {
  complete: (method: PaymentMethod) => void;
  decline: () => void;
  startDelayed: (method: PaymentMethod) => void;
  duplicate: () => void;
  expireQr: () => void;
}

export function PaymentScreen({ orderId }: { orderId: string | null }) {
  const router = useRouter();
  const { hydrated, orders, patchOrder, setStatus, clearCart, pushToast, sim } = useStore();

  const order = orderId ? orders.find((o) => o.id === orderId) : undefined;

  const [method, setMethod] = useState<PaymentMethod>("visa");
  const [card, setCard] = useState<CardFields>(EMPTY_CARD);
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CardFields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const [phase, setPhase] = useState<Phase>("select");
  const [duplicateNotice, setDuplicateNotice] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [qrState, setQrState] = useState<QrState>("generating");
  const [qrCycle, setQrCycle] = useState(0);
  const [qrChecking, setQrChecking] = useState(false);
  const [qrNotYet, setQrNotYet] = useState(false);
  const [branchSent, setBranchSent] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const inFlight = useRef(false);
  const cardRef = useRef(card);
  cardRef.current = card;
  const runRef = useRef<Runners | null>(null);

  const afterProcessing = useDelayedStep();
  const afterQr = useDelayedStep();
  const afterSuccess = useDelayedStep();
  const afterRoute = useDelayedStep();

  const ff = sim.fastForward;
  const branch = order ? branchById(order.branchId) : undefined;
  const provider = method === "duitnow_qr" ? "OXPay" : "Maybank";

  /* ---------------------------------------------------------------- */
  /* Simulated outcomes                                                */
  /* ---------------------------------------------------------------- */

  const paymentReference = (o: Order, m: PaymentMethod) =>
    m === "duitnow_qr" ? `OXP-QR-${o.code.slice(-8)}` : `MBB-TXN-${o.code.slice(-8)}`;

  const complete = (m: PaymentMethod) => {
    if (!order || !branch) return;
    inFlight.current = false;
    setQrChecking(false);
    const prov = m === "duitnow_qr" ? "OXPay" : "Maybank";
    patchOrder(order.id, {
      payment: {
        ...order.payment,
        method: m,
        provider: prov,
        status: "paid",
        reference: paymentReference(order, m),
        paidAt: new Date().toISOString(),
        maskedCard: m === "visa" ? maskCard(cardRef.current.number) : undefined,
      },
    });
    setStatus(order.id, "PAID", `Payment received · ${prov}`, "system");
    clearCart();
    setPhase("success");

    afterSuccess(() => {
      setStatus(order.id, "WAITING_FOR_BRANCH", `Sent to ${branch.shortName}`, "system");
      setBranchSent(true);
      afterRoute(
        () => router.push(`/checkout/confirmation?order=${order.id}`),
        scaledMs(3, ff, 1400),
      );
    }, scaledMs(2, ff, 900));
  };

  const decline = () => {
    if (!order) return;
    inFlight.current = false;
    patchOrder(
      order.id,
      {
        payment: { ...order.payment, method: "visa", provider: "Maybank", status: "declined" },
      },
      {
        status: "PENDING_PAYMENT",
        label: "Card payment declined · Maybank",
        at: clockLabel(),
        actor: "system",
        note: DECLINE_REASON,
      },
    );
    setPhase("declined");
  };

  const startDelayed = (m: PaymentMethod) => {
    if (!order) return;
    inFlight.current = false;
    setQrChecking(false);
    const prov = m === "duitnow_qr" ? "OXPay" : "Maybank";
    patchOrder(order.id, {
      payment: { ...order.payment, method: m, provider: prov, status: "delayed" },
    });
    setPollAttempt(1);
    setPhase("delayed");
  };

  const duplicate = () => {
    if (!order) return;
    inFlight.current = false;
    setPhase("duplicate");
  };

  const expireQr = () => {
    if (!order) return;
    inFlight.current = false;
    setQrChecking(false);
    setQrState("expired");
    patchOrder(order.id, { payment: { ...order.payment, status: "expired" } });
  };

  runRef.current = { complete, decline, startDelayed, duplicate, expireQr };

  /* ---------------------------------------------------------------- */
  /* Timers                                                            */
  /* ---------------------------------------------------------------- */

  const qrRunning = method === "duitnow_qr" && qrState === "live" && phase === "select";

  const qrRemaining = useCountdown({
    seconds: QR_SECONDS,
    fastForward: ff,
    running: qrRunning,
    restartKey: qrCycle,
    onComplete: () => runRef.current?.expireQr(),
  });

  /* QR generation */
  useEffect(() => {
    if (method !== "duitnow_qr") return;
    setQrState("generating");
    setQrNotYet(false);
    const t = window.setTimeout(() => setQrState("live"), 650);
    return () => window.clearTimeout(t);
  }, [method, qrCycle]);

  /* The bank notifies us on its own while the QR is live */
  useEffect(() => {
    if (!qrRunning || sim.offline || sim.qrOutcome === "expire") return;
    const t = window.setTimeout(() => {
      if (sim.qrOutcome === "success") runRef.current?.complete("duitnow_qr");
      else runRef.current?.startDelayed("duitnow_qr");
    }, scaledMs(12, ff, 2400));
    return () => window.clearTimeout(t);
  }, [qrRunning, sim.offline, sim.qrOutcome, ff]);

  /* Keep-checking poll for a delayed confirmation */
  useEffect(() => {
    if (phase !== "delayed" || sim.offline) return;
    if (pollAttempt >= 3) {
      runRef.current?.complete(method);
      return;
    }
    const t = window.setTimeout(() => setPollAttempt((a) => a + 1), scaledMs(5, ff, 1600));
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pollAttempt, sim.offline, ff, method]);

  /* ---------------------------------------------------------------- */
  /* Actions                                                           */
  /* ---------------------------------------------------------------- */

  const visibleError = (field: keyof CardFields) =>
    submitted || touched[field] ? cardErrors[field] : undefined;

  const blurField = (field: keyof CardFields) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setCardErrors(validateCard(cardRef.current));
  };

  const payNow = () => {
    if (!order || sim.offline) return;

    if (inFlight.current) {
      setDuplicateNotice(true);
      return;
    }
    setDuplicateNotice(false);
    setQrNotYet(false);

    if (method === "visa") {
      const errs = validateCard(card);
      setCardErrors(errs);
      setSubmitted(true);
      if (Object.keys(errs).length > 0) {
        document.getElementById("method-visa")?.scrollIntoView({ block: "center" });
        return;
      }
      inFlight.current = true;
      patchOrder(order.id, {
        payment: {
          ...order.payment,
          method: "visa",
          provider: "Maybank",
          status: "processing",
          maskedCard: maskCard(card.number),
        },
      });
      setPhase("processing");
      afterProcessing(() => {
        const outcome = sim.cardOutcome;
        if (outcome === "success") runRef.current?.complete("visa");
        else if (outcome === "declined") runRef.current?.decline();
        else if (outcome === "delayed") runRef.current?.startDelayed("visa");
        else runRef.current?.duplicate();
      }, scaledMs(3, ff, 1800));
      return;
    }

    /* DuitNow QR — the customer tells us they have paid, we check with OXPay */
    if (qrState !== "live") return;
    inFlight.current = true;
    setQrChecking(true);
    afterQr(() => {
      inFlight.current = false;
      setQrChecking(false);
      if (sim.qrOutcome === "success") runRef.current?.complete("duitnow_qr");
      else if (sim.qrOutcome === "delayed") runRef.current?.startDelayed("duitnow_qr");
      else setQrNotYet(true);
    }, scaledMs(4, ff, 1800));
  };

  const retrySameOrder = () => {
    if (!order) return;
    inFlight.current = false;
    patchOrder(order.id, { payment: { ...order.payment, status: "unpaid" } });
    setPhase("select");
    setDuplicateNotice(false);
  };

  const cancelOrder = () => {
    if (!order) return;
    setStatus(order.id, "CANCELLED", "Cancelled by the customer before payment", "customer");
    pushToast({ tone: "neutral", title: "Order cancelled", body: "Nothing was charged." });
    router.push("/cart");
  };

  /* ---------------------------------------------------------------- */
  /* Loading · missing order                                           */
  /* ---------------------------------------------------------------- */

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-7 w-48" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-[16px]" />
            <Skeleton className="h-72 w-full rounded-[16px]" />
          </div>
          <Skeleton className="h-96 w-full rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (!order || !branch) {
    return (
      <div className="container-page py-14">
        <h1 className="text-[clamp(26px,3.6vw,40px)]">Payment</h1>
        <div className="mx-auto mt-8 max-w-xl">
          <ErrorState
            title="We could not find that order"
            body="The payment link is missing an order, or the order was created in an earlier session of this prototype. Nothing has been charged."
            requestId={`PAY-404-${(orderId ?? "none").toUpperCase()}`}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ButtonLink href="/checkout" variant="dark">
              Back to checkout
            </ButtonLink>
            <ButtonLink href="/menu" variant="secondary">
              Browse the menu
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  /* Full-screen card processing replaces everything else. */
  if (phase === "processing") {
    return (
      <PaymentProcessing amount={order.total} orderCode={order.code} provider="Maybank" />
    );
  }

  const alreadyPaid =
    phase !== "success" && order.payment.status === "paid" && order.status !== "PENDING_PAYMENT";

  /* ---------------------------------------------------------------- */

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[clamp(26px,3.6vw,40px)]">Payment</h1>
          <p className="num mt-1 text-[14px] text-grey">
            Order {order.code} · {branch.name}
          </p>
        </div>
        <div className="rounded-[14px] border border-line bg-white px-4 py-3 text-right">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-grey">Total to pay</p>
          <p className="num font-display text-[28px] font-bold leading-none text-ink">
            {money(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-y border-line py-3">
        <CheckoutSteps current={4} />
      </div>

      {sim.offline && (
        <div className="mt-5">
          <Callout tone="danger" icon="wifiOff" title="You are offline">
            Payment needs a connection. Your order is saved and nothing has been charged — reconnect
            and press Pay again.
          </Callout>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:gap-10">
        <div className="flex flex-col gap-5">
          {alreadyPaid && (
            <Callout
              tone="success"
              icon="check"
              title="This order is already paid"
              action={
                <ButtonLink href={`/checkout/confirmation?order=${order.id}`} size="sm" variant="dark">
                  View order
                </ButtonLink>
              }
            >
              We received {money(order.total)} for {order.code}. You will not be charged again.
            </Callout>
          )}

          {/* ---------------- method selection + forms ---------------- */}
          {phase === "select" && (
            <section aria-labelledby="method-title">
              <h2 id="method-title" className="text-[20px]">
                Choose how to pay
              </h2>
              <p className="mt-1 text-[14px] text-grey">
                Two ways to pay, both secure. Nothing is charged until you confirm.
              </p>

              {duplicateNotice && (
                <div className="mt-3">
                  <Callout tone="warning" role="alert" icon="shield" title="Payment already in progress">
                    {DUPLICATE_SENTENCE}
                  </Callout>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3">
                <div id="method-visa">
                  <ChoiceRow
                    name="payment-method"
                    checked={method === "visa"}
                    onChange={() => setMethod("visa")}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        Pay securely with Visa
                        <Badge tone="neutral" soft icon="card">
                          Card
                        </Badge>
                      </span>
                    }
                    description="Payment processed securely by Maybank"
                  >
                    <PaymentCardForm
                      fields={card}
                      errors={{
                        number: visibleError("number"),
                        name: visibleError("name"),
                        expiry: visibleError("expiry"),
                        cvv: visibleError("cvv"),
                      }}
                      saveCard={saveCard}
                      disabled={sim.offline}
                      onChange={(patch) => setCard((c) => ({ ...c, ...patch }))}
                      onBlur={blurField}
                      onSaveCardChange={setSaveCard}
                    />
                  </ChoiceRow>
                </div>

                <div id="method-qr">
                  <ChoiceRow
                    name="payment-method"
                    checked={method === "duitnow_qr"}
                    onChange={() => setMethod("duitnow_qr")}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        Scan and pay with DuitNow QR
                        <Badge tone="neutral" soft icon="qr">
                          QR
                        </Badge>
                      </span>
                    }
                    description="DuitNow QR powered by OXPay"
                  >
                    <PaymentQrPanel
                      seed={`${order.code}-${qrCycle}`}
                      state={qrState}
                      remaining={qrRemaining}
                      amount={order.total}
                      reference={`OXP-QR-${order.code.slice(-8)}`}
                      disabled={sim.offline}
                      onRegenerate={() => {
                        setQrCycle((c) => c + 1);
                        setQrNotYet(false);
                        patchOrder(order.id, {
                          payment: { ...order.payment, status: "unpaid" },
                        });
                      }}
                      onSaveQr={() =>
                        pushToast({
                          tone: "success",
                          title: "QR saved to your photos",
                          body: "Open it in your banking app to scan from another device.",
                        })
                      }
                      onOpenBankingApp={() =>
                        pushToast({
                          tone: "neutral",
                          title: "Opening your banking app",
                          body: "On a phone this hands over to your default DuitNow app.",
                        })
                      }
                    />

                    {qrNotYet && (
                      <div className="mt-3">
                        <Callout tone="warning" role="status" title="No payment received yet">
                          We have not seen a payment for this code. Keep the QR open — this page
                          updates on its own — or generate a new code if it has expired.
                        </Callout>
                      </div>
                    )}
                  </ChoiceRow>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  full
                  size="lg"
                  onClick={payNow}
                  loading={qrChecking}
                  disabled={
                    sim.offline || alreadyPaid || (method === "duitnow_qr" && qrState !== "live")
                  }
                  iconStart={sim.offline ? "wifiOff" : "lock"}
                >
                  {method === "visa"
                    ? `Pay ${money(order.total)}`
                    : qrChecking
                      ? "Checking with OXPay…"
                      : "I have paid — check status"}
                </Button>
                <p className="mt-2 text-center text-[12px] leading-snug text-grey">
                  {method === "visa"
                    ? "You will see a confirmation before we send the order to the kitchen."
                    : "The page updates on its own when OXPay confirms the transfer."}
                </p>
              </div>
            </section>
          )}

          {/* ---------------- declined ---------------- */}
          {phase === "declined" && (
            <section aria-labelledby="declined-title">
              <Callout tone="danger" role="alert" icon="cross" title="Your payment was declined">
                <p>
                  <span className="font-semibold">Reason from Maybank:</span> {DECLINE_REASON}
                </p>
                <p className="mt-2">
                  Nothing was charged. Order{" "}
                  <span className="num font-semibold">{order.code}</span> is still open — retrying
                  uses the same order, so you can never end up with two.
                </p>
              </Callout>
              <h2 id="declined-title" className="sr-only">
                Payment declined
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" iconStart="card" onClick={retrySameOrder}>
                  Retry this payment
                </Button>
                <Button
                  variant="secondary"
                  iconStart="qr"
                  onClick={() => {
                    setMethod("duitnow_qr");
                    retrySameOrder();
                  }}
                >
                  Pay with DuitNow QR instead
                </Button>
              </div>
              <ul className="mt-4 flex flex-col gap-1.5 text-[13px] leading-snug text-grey">
                <li>· Check the card number, expiry and security code.</li>
                <li>· Your bank may need to approve an online payment first.</li>
                <li>· A different card or DuitNow QR usually works straight away.</li>
              </ul>
            </section>
          )}

          {/* ---------------- confirmation delayed ---------------- */}
          {phase === "delayed" && (
            <section aria-labelledby="delayed-title">
              <Panel className="p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow/40 text-ink">
                    <Icon name="hourglass" size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 id="delayed-title" className="text-[20px]">
                      We&rsquo;re still confirming with {provider}
                    </h2>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink/80">
                      Your payment went through but the confirmation is slow to come back. Do not
                      pay again — we keep checking and your order appears automatically.
                    </p>
                  </div>
                </div>

                <div
                  aria-live="polite"
                  className="mt-4 flex items-center gap-2 rounded-[12px] border border-line bg-cream/70 px-3 py-2.5"
                >
                  <span className="pulse-dot size-2.5 shrink-0 rounded-full bg-deep" aria-hidden />
                  <Icon name="refund" size={15} />
                  <span className="num text-[14px] font-medium text-ink">
                    Checking again · attempt {pollAttempt} of 3
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="dark" iconStart="refund" onClick={() => setPollAttempt(3)}>
                    Check now
                  </Button>
                  <ButtonLink href="/track" variant="secondary">
                    Track this order later
                  </ButtonLink>
                </div>

                <p className="num mt-4 border-t border-line pt-3 text-[12px] text-grey">
                  Reference {order.payment.reference} · we will email {order.customerEmail ?? "you"}{" "}
                  either way.
                </p>
              </Panel>
            </section>
          )}

          {/* ---------------- duplicate prevented ---------------- */}
          {phase === "duplicate" && (
            <section aria-labelledby="duplicate-title">
              <Callout
                tone="warning"
                role="alert"
                icon="shield"
                title="Payment already in progress"
              >
                <p>{DUPLICATE_SENTENCE}</p>
                <p className="mt-2 num">
                  Order {order.code} · {money(order.total)}
                </p>
              </Callout>
              <h2 id="duplicate-title" className="sr-only">
                Duplicate payment prevented
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="dark"
                  iconStart="refund"
                  onClick={() => {
                    inFlight.current = true;
                    setPhase("processing");
                    afterProcessing(() => runRef.current?.complete(method), scaledMs(3, ff, 1600));
                  }}
                >
                  Check payment status
                </Button>
                <ButtonLink href="/track" variant="secondary">
                  Find my order
                </ButtonLink>
              </div>
            </section>
          )}

          {/* ---------------- success ---------------- */}
          {phase === "success" && (
            <section aria-labelledby="success-title" aria-live="polite">
              <Panel className="p-6 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-deep text-white">
                  <Icon name="check" size={26} />
                </span>
                <h2 id="success-title" className="mt-4 text-[24px]">
                  Payment successful
                </h2>
                <p className="num mt-1 text-[18px] font-semibold text-ink">{money(order.total)}</p>
                <p className="mt-1 text-[13px] text-grey">
                  {method === "duitnow_qr" ? "DuitNow QR · OXPay" : "Visa card · Maybank"} ·{" "}
                  {order.payment.reference}
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 rounded-[12px] bg-mint px-4 py-3">
                  {branchSent ? (
                    <>
                      <Icon name="hourglass" size={16} />
                      <span className="text-[14px] font-medium text-deep">
                        Sent to {branch.shortName} — waiting for the branch to confirm
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="pulse-dot size-2.5 rounded-full bg-deep" aria-hidden />
                      <span className="text-[14px] font-medium text-deep">
                        Sending your order to {branch.shortName}…
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-5">
                  <ButtonLink href={`/checkout/confirmation?order=${order.id}`} iconEnd="arrowRight">
                    Continue to your order
                  </ButtonLink>
                </div>
              </Panel>
            </section>
          )}

          {/* ---------------- footer actions ---------------- */}
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4">
            {canCustomerCancel(order.status) ? (
              <Button variant="ghost" iconStart="cross" onClick={() => setCancelOpen(true)}>
                Cancel this order
              </Button>
            ) : (
              <p className="text-[13px] text-grey">
                This order is paid, so it can no longer be cancelled here.
              </p>
            )}
            <Link
              href="/checkout"
              className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-ink underline underline-offset-4"
            >
              <Icon name="chevronLeft" size={15} />
              Back to checkout details
            </Link>
          </div>
        </div>

        {/* ---------------- read-only summary ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PaymentOrderSummary order={order} />
          <p className="mt-3 text-[12px] leading-snug text-grey">
            Prototype: no card is charged, no QR is registered with a bank and no money moves.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancelOrder}
        destructive
        title="Cancel this order?"
        confirmLabel="Cancel the order"
        cancelLabel="Keep the order"
        body={
          <p>
            Nothing has been charged, so you can cancel free of charge. Your items stay in your cart
            if you want to try again.
          </p>
        }
      />
    </div>
  );
}
