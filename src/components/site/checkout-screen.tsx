"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRANCHES, MOCK_USER, branchById } from "@/lib/mock-data";
import { branchStatus, cn, etaRange, money, todayHours } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Address, Branch } from "@/lib/types";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  EmptyState,
  Panel,
  Skeleton,
} from "@/components/ui/primitives";
import { ChoiceRow, Segmented, TextAreaField, TextField } from "@/components/ui/forms";
import { TotalsBlock } from "@/components/ui/data";
import { Icon } from "@/components/ui/icons";
import { CheckoutAddressForm } from "./checkout-address-form";
import { CheckoutDeliveryQuote } from "./checkout-delivery-quote";
import { CheckoutSteps, type CheckoutStep } from "./checkout-steps";

/**
 * Simulated coverage check. The Office address sits outside the delivery
 * radius of both branches, which is how the prototype demonstrates the
 * "delivery unavailable for this address" rule.
 */
const OUT_OF_RADIUS = new Set(["addr-office"]);

const SECTION_ID: Record<CheckoutStep, string> = {
  1: "step-fulfilment",
  2: "step-details",
  3: "step-review",
  4: "step-review",
};

export function CheckoutScreen() {
  const router = useRouter();
  const {
    hydrated,
    lines,
    draft,
    patchDraft,
    addresses,
    addAddress,
    branchId,
    setBranchId,
    totals,
    sim,
    createOrder,
    patchOrder,
    pushToast,
  } = useStore();

  const [addingAddress, setAddingAddress] = useState(false);
  const [feeAdjustment, setFeeAdjustment] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [radiusBlock, setRadiusBlock] = useState<Address | null>(null);

  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* ---- guest vs signed-in contact details ---- */
  useEffect(() => {
    const d = draftRef.current;
    if (sim.signedIn) {
      if (!d.contactName.trim() && !d.contactPhone.trim()) {
        patchDraft({
          contactName: MOCK_USER.name,
          contactPhone: MOCK_USER.phone,
          contactEmail: MOCK_USER.email,
        });
      }
      return;
    }
    if (d.contactName === MOCK_USER.name && d.contactPhone === MOCK_USER.phone) {
      patchDraft({ contactName: "", contactPhone: "", contactEmail: "", createAccount: false });
    }
  }, [sim.signedIn, patchDraft]);

  /* ---- an address outside the radius forces pickup ---- */
  useEffect(() => {
    if (draft.fulfilment !== "delivery") return;
    const selected = addresses.find((a) => a.id === draft.addressId);
    if (selected && OUT_OF_RADIUS.has(selected.id)) {
      setRadiusBlock(selected);
      patchDraft({ fulfilment: "pickup" });
    }
  }, [draft.fulfilment, draft.addressId, addresses, patchDraft]);

  const orderableLines = lines.filter((l) => !l.unavailableAt);
  const blockedLines = lines.filter((l) => l.unavailableAt);
  const itemCount = orderableLines.reduce((n, l) => n + l.quantity, 0);

  const selectedAddress = addresses.find((a) => a.id === draft.addressId) ?? null;
  const branch = branchById(branchId);
  const sortedBranches = useMemo(() => [...BRANCHES].sort((a, b) => a.distanceKm - b.distanceKm), []);
  const nearestId = sortedBranches[0]?.id;

  const branchBlockReason = (b: Branch): string | null => {
    if (draft.fulfilment === "delivery" && !b.supportsDelivery) {
      return "This branch does not deliver — choose pickup or the other branch";
    }
    if (draft.fulfilment === "pickup" && !b.supportsPickup) {
      return "This branch does not offer pickup";
    }
    const status = branchStatus(b);
    if (!status.open) return `Closed right now · ${status.detail}`;
    return null;
  };

  const openBranches = sortedBranches.filter((b) => branchBlockReason(b) === null);
  const branchBlocked = branchBlockReason(branch) !== null;

  /* ---- move off a branch that cannot take this order ---- */
  useEffect(() => {
    if (!branchBlocked || openBranches.length === 0) return;
    const next = openBranches[0];
    setBranchId(next.id);
    pushToast({
      tone: "warning",
      title: `Switched to ${next.shortName}`,
      body: `${branch.shortName} cannot take this order right now.`,
    });
    // Only react to the branch becoming unavailable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchBlocked]);

  /* ---- totals, adjusted by any Lalamove re-quote ---- */
  const isDelivery = draft.fulfilment === "delivery";
  const deliveryFee = isDelivery ? totals.deliveryFee + feeAdjustment : 0;
  const grandTotal = totals.total - totals.deliveryFee + deliveryFee;

  /* ---- validation ---- */
  const errors = {
    contactName: !draft.contactName.trim() ? "Enter the name for this order." : undefined,
    contactPhone: !/^[+\d][\d\s()-]{7,}$/.test(draft.contactPhone.trim())
      ? "Enter a phone number the branch or rider can call."
      : undefined,
    contactEmail: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())
      ? "Enter an email address so we can send the receipt."
      : undefined,
    address: isDelivery && !selectedAddress ? "Choose a delivery address." : undefined,
  };
  const show = (key: keyof typeof errors) =>
    submitted || touched[key] ? errors[key] : undefined;

  const detailsDone =
    !errors.contactName && !errors.contactPhone && !errors.contactEmail && !errors.address;
  const fulfilmentDone = !branchBlocked && (!isDelivery || Boolean(selectedAddress));
  const currentStep: CheckoutStep = !fulfilmentDone ? 1 : !detailsDone ? 2 : 3;

  const canContinue =
    hydrated &&
    orderableLines.length > 0 &&
    fulfilmentDone &&
    detailsDone &&
    !sim.offline &&
    openBranches.length > 0;

  const goToStep = (step: CheckoutStep) => {
    document.getElementById(SECTION_ID[step])?.scrollIntoView({ block: "start" });
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (!fulfilmentDone) {
      goToStep(1);
      return;
    }
    if (!detailsDone) {
      goToStep(2);
      return;
    }
    if (!canContinue) return;

    setPlacing(true);
    const order = createOrder();
    if (feeAdjustment !== 0 && order.fulfilment === "delivery") {
      patchOrder(order.id, {
        deliveryFee: order.deliveryFee + feeAdjustment,
        total: order.total + feeAdjustment,
        delivery: order.delivery
          ? { ...order.delivery, fee: order.delivery.fee + feeAdjustment }
          : undefined,
      });
    }
    router.push(`/checkout/payment?order=${order.id}`);
  };

  /* ---------------------------------------------------------------- */
  /* Loading                                                           */
  /* ---------------------------------------------------------------- */

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-7 w-72" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-11 w-64 rounded-full" />
            <Skeleton className="h-40 w-full rounded-[16px]" />
            <Skeleton className="h-56 w-full rounded-[16px]" />
            <Skeleton className="h-64 w-full rounded-[16px]" />
          </div>
          <Skeleton className="h-96 w-full rounded-[16px]" />
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Empty cart                                                        */
  /* ---------------------------------------------------------------- */

  if (orderableLines.length === 0) {
    return (
      <div className="container-page py-14">
        <h1 className="text-[clamp(28px,4vw,44px)]">Checkout</h1>
        <div className="mx-auto mt-8 max-w-xl">
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            body="Add something from the menu and your checkout will pick up right here."
            action={
              <ButtonLink href="/menu" iconEnd="arrowRight">
                Browse the menu
              </ButtonLink>
            }
          />
          {blockedLines.length > 0 && (
            <div className="mt-4">
              <Callout tone="warning" title="Some items need attention">
                {blockedLines.length} item{blockedLines.length > 1 ? "s are" : " is"} unavailable at{" "}
                {branch.shortName}.{" "}
                <Link href="/cart" className="font-semibold underline underline-offset-2">
                  Fix them in your cart
                </Link>
                .
              </Callout>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[clamp(26px,3.6vw,40px)]">Checkout</h1>
        <Link
          href="/cart"
          className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-ink underline underline-offset-4"
        >
          <Icon name="chevronLeft" size={15} />
          Back to cart
        </Link>
      </div>

      <div className="mt-5 border-y border-line py-3">
        <CheckoutSteps current={currentStep} onSelect={goToStep} />
      </div>

      {sim.offline && (
        <div className="mt-5">
          <Callout tone="danger" icon="wifiOff" title="You are offline">
            Checkout needs a connection so we can hold your branch slot and price the delivery.
            Your cart is saved on this device.
          </Callout>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:gap-10">
        {/* ---------------------------------------------------------- */}
        {/* Left column — steps 1 to 3                                  */}
        {/* ---------------------------------------------------------- */}
        <div className="flex flex-col gap-6">
          {/* Step 1 — fulfilment */}
          <section id="step-fulfilment" aria-labelledby="fulfilment-title" className="scroll-mt-24">
            <h2 id="fulfilment-title" className="text-[20px]">
              1. How would you like your order?
            </h2>
            <div className="mt-3">
              <Segmented
                label="Fulfilment type"
                value={draft.fulfilment}
                onChange={(v) => patchDraft({ fulfilment: v })}
                options={[
                  { value: "pickup", label: "Pickup", icon: "bag" },
                  {
                    value: "delivery",
                    label: "Delivery",
                    icon: "bike",
                    disabled: Boolean(radiusBlock),
                    hint: radiusBlock
                      ? `Delivery is unavailable for the ${radiusBlock.label} address`
                      : undefined,
                  },
                ]}
              />
            </div>

            {radiusBlock && (
              <div className="mt-3">
                <Callout
                  tone="warning"
                  icon="pin"
                  title="Delivery is not available for that address"
                  action={
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setRadiusBlock(null);
                        const fallback =
                          addresses.find((a) => !OUT_OF_RADIUS.has(a.id))?.id ?? null;
                        patchDraft({ addressId: fallback, fulfilment: "delivery" });
                      }}
                    >
                      Use another address
                    </Button>
                  }
                >
                  <span className="num">{radiusBlock.label}</span> — {radiusBlock.line1},{" "}
                  {radiusBlock.city} is outside the {branch.deliveryRadiusKm} km delivery radius of
                  both branches, so we have selected <strong>Pickup</strong> for you.
                </Callout>
              </div>
            )}

            {isDelivery && (
              <div className="mt-4">
                <h3 className="text-[16px]">Deliver to</h3>
                <div className="mt-2 flex flex-col gap-2">
                  {addresses.map((a) => {
                    const outside = OUT_OF_RADIUS.has(a.id);
                    return (
                      <ChoiceRow
                        key={a.id}
                        name="delivery-address"
                        checked={draft.addressId === a.id}
                        onChange={() => patchDraft({ addressId: a.id })}
                        disabled={outside}
                        disabledReason={
                          outside ? "Outside our delivery radius — pickup only" : undefined
                        }
                        title={
                          <span className="flex flex-wrap items-center gap-2">
                            {a.label}
                            {a.isDefault && (
                              <Badge tone="neutral" soft icon="check">
                                Default
                              </Badge>
                            )}
                          </span>
                        }
                        description={
                          <>
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ""}, {a.postcode} {a.city}, {a.state}
                            {a.notes ? ` · ${a.notes}` : ""}
                          </>
                        }
                      />
                    );
                  })}
                </div>

                {show("address") && (
                  <p
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-cta"
                  >
                    <Icon name="alert" size={13} />
                    {show("address")}
                  </p>
                )}

                <div className="mt-3">
                  {addingAddress ? (
                    <CheckoutAddressForm
                      onCancel={() => setAddingAddress(false)}
                      onAdd={(address) => {
                        const id = addAddress(address);
                        patchDraft({ addressId: id });
                        setAddingAddress(false);
                        pushToast({ tone: "success", title: `${address.label} saved` });
                      }}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      iconStart="plus"
                      onClick={() => setAddingAddress(true)}
                    >
                      Add a new address
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Branch selection */}
            <div className="mt-6">
              <h3 className="text-[16px]">Fulfilling branch</h3>
              <p className="mt-1 text-[13px] text-grey">
                Menu, prices and availability are set per branch.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {sortedBranches.map((b) => {
                  const reason = branchBlockReason(b);
                  const status = branchStatus(b);
                  return (
                    <ChoiceRow
                      key={b.id}
                      name="branch"
                      checked={branchId === b.id}
                      onChange={() => setBranchId(b.id)}
                      disabled={Boolean(reason)}
                      disabledReason={reason ?? undefined}
                      title={
                        <span className="flex flex-wrap items-center gap-2">
                          {b.name}
                          {b.id === nearestId && (
                            <Badge tone="info" soft icon="location">
                              Nearest to you
                            </Badge>
                          )}
                          <Badge
                            tone={status.open ? "success" : "neutral"}
                            soft={!status.open}
                            icon={status.open ? "check" : "clock"}
                          >
                            {status.open ? status.detail : status.detail}
                          </Badge>
                        </span>
                      }
                      description={
                        <span className="num">
                          {b.distanceKm} km away · {isDelivery ? "Delivery" : "Ready"} in{" "}
                          {etaRange(b, draft.fulfilment)} · Today {todayHours(b)}
                        </span>
                      }
                    />
                  );
                })}
              </div>
              {openBranches.length === 0 && (
                <div className="mt-3">
                  <Callout tone="danger" title="Both branches are closed right now">
                    Online ordering reopens when a branch opens. You can still browse the menu and
                    come back later.
                  </Callout>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — details */}
          <section
            id="step-details"
            aria-labelledby="details-title"
            className="scroll-mt-24 border-t border-line pt-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="details-title" className="text-[20px]">
                2. Contact details
              </h2>
              {sim.signedIn ? (
                <Badge tone="info" soft icon="user">
                  Signed in as {MOCK_USER.name}
                </Badge>
              ) : (
                <Badge tone="warning" soft icon="user">
                  Guest checkout
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[14px] leading-relaxed text-grey">
              {sim.signedIn
                ? "We have prefilled your saved details. The branch and the rider use this to reach you."
                : "You are checking out as a guest. We need these details so the branch can reach you and send your receipt — we will also email you a tracking link."}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TextField
                label="Name"
                required
                autoComplete="name"
                value={draft.contactName}
                error={show("contactName")}
                onChange={(e) => patchDraft({ contactName: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, contactName: true }))}
              />
              <TextField
                label="Phone number"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="+60 12-345 6789"
                hint="The branch and the rider call this number."
                value={draft.contactPhone}
                error={show("contactPhone")}
                onChange={(e) => patchDraft({ contactPhone: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, contactPhone: true }))}
              />
              <TextField
                label="Email for receipt"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                wrapperClassName="sm:col-span-2"
                hint={
                  sim.signedIn
                    ? "Your receipt and any refund confirmation go here."
                    : "Your receipt and your guest tracking link go here."
                }
                value={draft.contactEmail}
                error={show("contactEmail")}
                onChange={(e) => patchDraft({ contactEmail: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, contactEmail: true }))}
              />
            </div>

            <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-[12px] border border-line bg-white p-3.5">
              <input
                type="checkbox"
                checked={draft.createAccount}
                onChange={(e) => patchDraft({ createAccount: e.target.checked })}
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-cta)]"
              />
              <span>
                <span className="block text-[15px] font-medium text-ink">
                  Create an account to track future orders
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-grey">
                  We will send a link to set a password after this order. Your order history, saved
                  addresses and receipts stay in one place.
                </span>
              </span>
            </label>

            {isDelivery && (
              <div className="mt-4">
                <TextAreaField
                  label="Delivery notes"
                  hint="Gate code, landmark, or where the rider should wait. The branch sees this too."
                  maxLength={200}
                  showCount
                  value={draft.deliveryNotes}
                  onChange={(e) => patchDraft({ deliveryNotes: e.target.value })}
                />
              </div>
            )}
          </section>

          {/* Step 3 — review */}
          <section
            id="step-review"
            aria-labelledby="review-title"
            className="scroll-mt-24 border-t border-line pt-6"
          >
            <h2 id="review-title" className="text-[20px]">
              3. Review your order
            </h2>

            {blockedLines.length > 0 && (
              <div className="mt-3">
                <Callout tone="warning" title="Not included in this order">
                  <ul className="list-disc pl-4">
                    {blockedLines.map((l) => (
                      <li key={l.lineId}>
                        {l.name} — unavailable at {branchById(l.unavailableAt ?? branchId).shortName}
                      </li>
                    ))}
                  </ul>
                  <Link href="/cart" className="mt-1 inline-block font-semibold underline underline-offset-2">
                    Change them in your cart
                  </Link>
                </Callout>
              </div>
            )}

            <Panel className="mt-3 p-4">
              <ul className="flex flex-col gap-3">
                {orderableLines.map((l) => (
                  <li key={l.lineId} className="flex gap-3">
                    <span className="num mt-0.5 shrink-0 rounded-[6px] bg-mint px-1.5 py-0.5 text-[12px] font-bold text-deep">
                      {l.quantity}×
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-ink">{l.name}</p>
                      {l.options.length > 0 && (
                        <p className="text-[12px] leading-snug text-grey">
                          {l.options.map((o) => o.choiceName).join(" · ")}
                        </p>
                      )}
                      {l.notes && (
                        <p className="text-[12px] italic leading-snug text-grey">“{l.notes}”</p>
                      )}
                    </div>
                    <span className="num shrink-0 text-[14px] font-medium text-ink">
                      {money(l.unitPrice * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-line pt-3">
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-[12px] text-grey">
                      {isDelivery ? "Delivering from" : "Collecting from"}
                    </dt>
                    <dd className="text-[14px] font-medium text-ink">
                      {branch.name} · {branch.address}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[12px] text-grey">
                      {isDelivery ? "Delivering to" : "Ready in"}
                    </dt>
                    <dd className="text-[14px] font-medium text-ink">
                      {isDelivery && selectedAddress
                        ? `${selectedAddress.line1}${selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}, ${selectedAddress.postcode} ${selectedAddress.city}`
                        : etaRange(branch, draft.fulfilment)}
                    </dd>
                  </div>
                </dl>
              </div>
            </Panel>
          </section>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Right column — sticky summary                               */}
        {/* ---------------------------------------------------------- */}
        <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:self-start">
          <Panel className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="summary-title" className="text-[18px]">
                Summary
              </h2>
              <span className="num text-[13px] text-grey">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3">
              <TotalsBlock
                subtotal={totals.subtotal}
                discount={totals.discount}
                deliveryFee={deliveryFee}
                tax={totals.tax}
                total={grandTotal}
                promotionLabel={totals.promotionLabel}
                fulfilment={draft.fulfilment}
              />
            </div>

            <CheckoutDeliveryQuote
              active={isDelivery && !sim.offline}
              fastForward={sim.fastForward}
              currentFee={deliveryFee}
              onFeeChange={(delta) => setFeeAdjustment((f) => f + delta)}
            />

            <div className="mt-4">
              <Button
                full
                size="lg"
                onClick={handleContinue}
                loading={placing}
                disabled={sim.offline || openBranches.length === 0}
                iconEnd="arrowRight"
              >
                Continue to payment
              </Button>
              {!canContinue && !sim.offline && openBranches.length > 0 && (
                <p className="mt-2 text-[12px] leading-snug text-grey">
                  Complete the {currentStep === 1 ? "fulfilment" : "contact"} step to continue.
                </p>
              )}
            </div>

            <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[12px] leading-snug text-grey">
              <li className="flex items-start gap-1.5">
                <span className="mt-px shrink-0 text-deep">
                  <Icon name="lock" size={13} />
                </span>
                You choose how to pay on the next step. Nothing is charged yet.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-px shrink-0 text-deep">
                  <Icon name="receipt" size={13} />
                </span>
                All prices include SST at 6%.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-px shrink-0 text-deep">
                  <Icon name="clock" size={13} />
                </span>
                You can cancel free of charge until your payment completes.
              </li>
            </ul>
          </Panel>

          <p className={cn("mt-3 text-center text-[12px] text-grey", "lg:text-left")}>
            Prototype: no payment is taken and no order reaches a real branch.
          </p>
        </aside>
      </div>
    </div>
  );
}
