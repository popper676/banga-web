"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import {
  DetailRow,
  FulfilmentTag,
  LiveAnnouncer,
  NoteFlag,
  PrototypeNote,
  dateTimeOf,
  maskEmail,
  maskPhone,
  orderNoteFlags,
  relativeAge,
  timeOf,
  useOpsClock,
} from "@/components/admin/ops-shared";
import { OrderActionBar, blockedReason, useOrderOps } from "@/components/admin/order-actions";
import { AUDIT_LOG, PROTOTYPE_RULES, branchById } from "@/lib/mock-data";
import { canCustomerCancel } from "@/lib/status";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/icons";
import { TextAreaField } from "@/components/ui/forms";
import { ConfirmDialog } from "@/components/ui/overlays";
import { EventTimeline, OrderLinesList, TotalsBlock } from "@/components/ui/data";
import { MapView } from "@/components/ui/media";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  EmptyState,
  PaymentBadge,
  Skeleton,
  StatusBadge,
} from "@/components/ui/primitives";

/** Notes staff leave for each other. Never shown to the customer. */
interface InternalNote {
  id: string;
  at: string;
  author: string;
  text: string;
}

const SEEDED_NOTES: Record<string, InternalNote[]> = {
  "o-0138": [
    {
      id: "n-1",
      at: "19:03",
      author: "Farah Yusof · Branch Staff",
      text: "Customer called to ask for extra sauce on the side. Added to the ticket.",
    },
  ],
  "o-0131": [
    {
      id: "n-2",
      at: "17:39",
      author: "Jun Ho Park · Branch Manager",
      text: "Tried Lalamove twice, no rider. Asked the customer if they can collect instead — waiting for a reply.",
    },
  ],
};

type RailAction = "kitchen" | "receipt" | "resend" | "refund" | "cancel" | null;

export function OrderDetail({ orderId }: { orderId: string }) {
  const { orders, hydrated, pushToast, setStatus } = useStore();
  const { print, resendConfirmation, advance } = useOrderOps();
  const now = useOpsClock(5000);

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [sessionAudit, setSessionAudit] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [notes, setNotes] = useState<InternalNote[]>(SEEDED_NOTES[orderId] ?? []);
  const [rail, setRail] = useState<RailAction>(null);
  const [announcement, setAnnouncement] = useState("");

  const order = orders.find((o) => o.id === orderId);
  const loading = !hydrated || now === null;
  const clock = now ?? Date.parse("2026-09-21T19:08:00+08:00");

  if (loading) {
    return (
      <AdminShell title="Order" description="Loading order…">
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="flex flex-col gap-5 xl:col-span-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-52 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell title="Order not found" description="This order is not in the prototype data set">
        <EmptyState
          icon="search"
          title="We could not find that order"
          body={`Nothing matches the reference “${orderId}”. It may have been placed at a branch you cannot see, or the link is out of date.`}
          action={
            <ButtonLink href="/admin/orders" size="sm" iconStart="list">
              Back to all orders
            </ButtonLink>
          }
        />
      </AdminShell>
    );
  }

  const branch = branchById(order.branchId);
  const flags = orderNoteFlags(order);
  const refundBlocked = blockedReason(order, "REFUND_PENDING");
  const refundLegal = ["REJECTED", "COMPLETED", "FAILED"].includes(order.status) && !refundBlocked;
  const cancelLegal = canCustomerCancel(order.status);
  const orderAudit = AUDIT_LOG.filter((a) => a.entity === order.code);

  function recordAudit(action: string) {
    const stamp = new Date(clock).toISOString().slice(11, 16);
    setSessionAudit((prev) => [`${stamp} · Aisyah Nordin · Super Admin · ${action}`, ...prev]);
  }

  function addNote() {
    const text = noteDraft.trim();
    if (!text) return;
    const stamp = new Date(clock).toISOString().slice(11, 16);
    setNotes((prev) => [
      { id: `n-${Date.now()}`, at: stamp, author: "Aisyah Nordin · Super Admin", text },
      ...prev,
    ]);
    setNoteDraft("");
    setAnnouncement("Internal note added. The customer cannot see internal notes.");
    pushToast({
      tone: "success",
      title: "Internal note added",
      body: "Visible to branch staff and admins only — never shown to the customer.",
    });
  }

  return (
    <AdminShell
      title={order.code}
      description={`${dateTimeOf(order.placedAt)} · ${branch.name} · ${money(order.total)} · ${
        order.fulfilment === "delivery" ? "Delivery" : "Pickup"
      }`}
      actions={
        <>
          <ButtonLink href="/admin/orders" size="sm" variant="ghost" iconStart="chevronLeft">
            All orders
          </ButtonLink>
          <OrderActionBar order={order} onDone={(s) => setAnnouncement(`Order moved to ${s.replace(/_/g, " ").toLowerCase()}.`)} />
        </>
      }
    >
      <LiveAnnouncer message={announcement} />

      {/* ---------------- Status strip ---------------- */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={order.status} audience="admin" />
        <PaymentBadge status={order.payment.status} soft />
        <FulfilmentTag type={order.fulfilment} branchName={branch.shortName} />
        <Badge tone="neutral" icon="clock" soft>
          Placed {relativeAge(order.placedAt, clock)}
        </Badge>
        {order.isGuest && (
          <Badge tone="neutral" icon="user" soft>
            Guest checkout
          </Badge>
        )}
        {order.promotionCode && (
          <Badge tone="warning" icon="tag" soft>
            {order.promotionCode}
          </Badge>
        )}
      </div>

      {order.status === "WAITING_FOR_BRANCH" && (
        <Callout
          tone="warning"
          icon="hourglass"
          title={`${branch.shortName} has not accepted this order yet`}
          className="mb-5"
        >
          {PROTOTYPE_RULES.branchSlaLabel} Accept or reject it from the{" "}
          <Link href="/admin/confirmation" className="font-semibold underline underline-offset-2">
            branch confirmation queue
          </Link>
          .
        </Callout>
      )}

      {order.payment.status === "manual_refund_required" && (
        <Callout tone="danger" icon="alert" title="Manual refund required" className="mb-5">
          {order.payment.manualRefundReason} Finance records the bank reference under Refunds.
        </Callout>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          {/* ---------------- Customer ---------------- */}
          <AdminCard
            title="Customer and contact"
            action={
              <Link
                href="/admin/customers"
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-deep hover:bg-mint"
              >
                Customer record
                <Icon name="chevronRight" size={14} />
              </Link>
            }
          >
            <dl>
              <DetailRow label="Name">{order.customerName}</DetailRow>
              <DetailRow label="Account">
                {order.isGuest ? "Guest checkout — no account" : "Registered account"}
              </DetailRow>
              <DetailRow label="Phone" mono>
                <span className="inline-flex items-center gap-2">
                  {phoneRevealed ? order.customerPhone : maskPhone(order.customerPhone)}
                  <button
                    onClick={() => {
                      const next = !phoneRevealed;
                      setPhoneRevealed(next);
                      if (next) {
                        recordAudit(`customer.phone_revealed · ${order.code}`);
                        setAnnouncement("Phone number revealed and recorded in the audit log.");
                        pushToast({
                          tone: "neutral",
                          title: "Phone number revealed",
                          body: "Recorded in the audit log as Aisyah Nordin, Super Admin.",
                        });
                      }
                    }}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-2.5 text-[12px] font-semibold text-deep hover:bg-mint"
                  >
                    <Icon name="eye" size={13} />
                    {phoneRevealed ? "Hide" : "Reveal"}
                  </button>
                </span>
              </DetailRow>
              {order.customerEmail && (
                <DetailRow label="Email">
                  <span className="inline-flex items-center gap-2">
                    {emailRevealed ? order.customerEmail : maskEmail(order.customerEmail)}
                    <button
                      onClick={() => {
                        const next = !emailRevealed;
                        setEmailRevealed(next);
                        if (next) recordAudit(`customer.email_revealed · ${order.code}`);
                      }}
                      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-2.5 text-[12px] font-semibold text-deep hover:bg-mint"
                    >
                      <Icon name="eye" size={13} />
                      {emailRevealed ? "Hide" : "Reveal"}
                    </button>
                  </span>
                </DetailRow>
              )}
              <DetailRow label="Branch">{branch.name}</DetailRow>
            </dl>
            <PrototypeNote>
              Contact details are masked by default. Every reveal is written to the audit log with the
              admin name, role and timestamp.
            </PrototypeNote>
          </AdminCard>

          {/* ---------------- Fulfilment ---------------- */}
          <AdminCard title={order.fulfilment === "delivery" ? "Delivery details" : "Pickup details"}>
            {order.fulfilment === "delivery" && order.address ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{order.address.label}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink">
                    {order.address.line1}
                    {order.address.line2 ? (
                      <>
                        <br />
                        {order.address.line2}
                      </>
                    ) : null}
                    <br />
                    {order.address.postcode} {order.address.city}, {order.address.state}
                  </p>
                  {order.address.notes && (
                    <p className="mt-2 rounded-[10px] bg-cream/70 px-2.5 py-2 text-[12.5px] text-ink">
                      <span className="font-semibold">Access note: </span>
                      {order.address.notes}
                    </p>
                  )}
                  <dl className="mt-2">
                    <DetailRow label="Distance from branch" mono>
                      {branch.distanceKm.toFixed(1)} km
                    </DetailRow>
                    <DetailRow label="Courier">
                      {order.delivery ? order.delivery.provider : "Not booked"}
                    </DetailRow>
                    {order.delivery?.riderName && (
                      <DetailRow label="Rider">
                        {order.delivery.riderName} · {order.delivery.riderPlate}
                      </DetailRow>
                    )}
                  </dl>
                  <div className="mt-2">
                    <ButtonLink href="/admin/delivery" size="sm" variant="secondary" iconStart="bike">
                      Delivery tracking
                    </ButtonLink>
                  </div>
                </div>
                <MapView
                  className="min-h-52"
                  label={`Map placeholder showing ${branch.shortName} and the delivery address in ${order.address.city}`}
                  route={["RIDER_PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.status)}
                  pins={[
                    { x: 25, y: 74, tone: "branch", name: branch.shortName },
                    { x: 80, y: 26, tone: "customer", name: order.address.label },
                  ]}
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <dl>
                  <DetailRow label="Collect at">{branch.name}</DetailRow>
                  <DetailRow label="Address">{branch.address}</DetailRow>
                  <DetailRow label="Finding it">{branch.mapHint}</DetailRow>
                  <DetailRow label="Branch phone" mono>
                    {branch.phone}
                  </DetailRow>
                  <DetailRow label="Collection code" mono>
                    {order.code.slice(-4)}
                  </DetailRow>
                </dl>
                <MapView
                  className="min-h-52"
                  label={`Map placeholder showing the ${branch.shortName} pickup counter`}
                  pins={[{ x: 45, y: 60, tone: "branch", name: branch.shortName }]}
                />
              </div>
            )}
          </AdminCard>

          {/* ---------------- Items ---------------- */}
          <AdminCard
            title={`Items (${order.lines.reduce((n, l) => n + l.quantity, 0)} units)`}
            action={
              <Button size="sm" variant="secondary" iconStart="printer" onClick={() => setRail("kitchen")}>
                Kitchen ticket
              </Button>
            }
          >
            <OrderLinesList order={order} />
            {flags.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-grey">
                  Notes the kitchen must read
                </p>
                {flags.map((f, i) => (
                  <NoteFlag key={i} flag={f} />
                ))}
              </div>
            )}
          </AdminCard>

          {/* ---------------- Totals + payment ---------------- */}
          <div className="grid gap-5 md:grid-cols-2">
            <AdminCard title="Totals">
              <TotalsBlock
                subtotal={order.subtotal}
                discount={order.discount}
                deliveryFee={order.deliveryFee}
                tax={order.tax}
                total={order.total}
                promotionLabel={order.promotionCode}
                fulfilment={order.fulfilment}
              />
            </AdminCard>

            <AdminCard title="Payment">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutral" icon={order.payment.method === "visa" ? "card" : "qr"} soft>
                  {order.payment.method === "visa" ? "Visa card" : "DuitNow dynamic QR"}
                </Badge>
                <PaymentBadge status={order.payment.status} />
              </div>
              <dl>
                <DetailRow label="Provider">
                  <span className="text-grey">{order.payment.provider}</span>
                </DetailRow>
                <DetailRow label="Amount" mono>
                  {money(order.payment.amount)}
                </DetailRow>
                <DetailRow label="Reference" mono>
                  {order.payment.reference}
                </DetailRow>
                {order.payment.maskedCard && (
                  <DetailRow label="Card" mono>
                    {order.payment.maskedCard}
                  </DetailRow>
                )}
                {order.payment.method === "duitnow_qr" && (
                  <DetailRow label="DuitNow reference" mono>
                    {order.payment.reference.replace("OXP-QR-", "DN-")}
                  </DetailRow>
                )}
                <DetailRow label="Paid at" mono>
                  {order.payment.paidAt ? dateTimeOf(order.payment.paidAt) : "Not paid"}
                </DetailRow>
                {order.payment.refundReference && (
                  <DetailRow label="Refund reference" mono>
                    {order.payment.refundReference}
                  </DetailRow>
                )}
                {order.payment.refundCompletedAt && (
                  <DetailRow label="Refund completed" mono>
                    {dateTimeOf(order.payment.refundCompletedAt)}
                  </DetailRow>
                )}
              </dl>
              {order.payment.refundNote && (
                <p className="mt-2 rounded-[10px] bg-cream/70 px-2.5 py-2 text-[12.5px] leading-snug text-ink">
                  {order.payment.refundNote}
                </p>
              )}
            </AdminCard>
          </div>

          {/* ---------------- Timeline ---------------- */}
          <AdminCard title="Order timeline">
            <EventTimeline events={order.events} />
            {order.rejectionReason && (
              <p className="mt-3 rounded-[10px] border border-cta/30 bg-cta/6 px-3 py-2 text-[13px] text-ink">
                <span className="font-semibold">Rejection reason: </span>
                {order.rejectionReason}
              </p>
            )}
          </AdminCard>

          {/* ---------------- Internal notes ---------------- */}
          <AdminCard title="Internal notes">
            <div className="flex flex-col gap-3">
              <TextAreaField
                label="Add an internal note"
                hint="Branch staff and admins only. Never shown to the customer and never printed on the receipt."
                placeholder="What should the next person on shift know?"
                maxLength={280}
                showCount
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" iconStart="plus" disabled={noteDraft.trim().length === 0} onClick={addNote}>
                  Add note
                </Button>
                {noteDraft && (
                  <Button size="sm" variant="ghost" onClick={() => setNoteDraft("")}>
                    Discard
                  </Button>
                )}
              </div>

              {notes.length === 0 ? (
                <p className="text-[13px] text-grey">No internal notes on this order yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-[10px] border border-line bg-cream/60 px-3 py-2">
                      <p className="text-[13px] text-ink">{n.text}</p>
                      <p className="num mt-1 text-[11.5px] text-grey">
                        {n.at} · {n.author}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminCard>

          {/* ---------------- Audit ---------------- */}
          <AdminCard
            title="Audit log for this order"
            action={
              <Link
                href="/admin/audit"
                className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-deep hover:bg-mint"
              >
                Full audit log
                <Icon name="chevronRight" size={14} />
              </Link>
            }
          >
            {orderAudit.length === 0 && sessionAudit.length === 0 ? (
              <p className="text-[13px] text-grey">No audit entries recorded against this order yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {sessionAudit.map((entry, i) => (
                  <li key={`s-${i}`} className="num text-[12.5px] text-ink">
                    <Badge tone="info" icon="eye" soft>
                      This session
                    </Badge>{" "}
                    {entry}
                  </li>
                ))}
                {orderAudit.map((a) => (
                  <li key={a.id} className="text-[12.5px] text-ink">
                    <span className="num text-grey">{a.at}</span> · {a.actor} ({a.role}) ·{" "}
                    <span className="num font-semibold">{a.action}</span> — {a.detail}
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        {/* ---------------- Right rail ---------------- */}
        <aside className="flex flex-col gap-5">
          <AdminCard title="Actions">
            <div className="flex flex-col gap-2">
              <OrderActionBar order={order} layout="column" size="md" />
            </div>
            <div className="my-3 border-t border-line" />
            <div className="flex flex-col gap-2">
              <Button variant="secondary" full iconStart="printer" onClick={() => setRail("kitchen")}>
                Print kitchen ticket
              </Button>
              <Button variant="secondary" full iconStart="receipt" onClick={() => setRail("receipt")}>
                Print receipt
              </Button>
              <Button variant="secondary" full iconStart="bell" onClick={() => setRail("resend")}>
                Resend confirmation
              </Button>
              <div>
                <Button
                  variant="destructive"
                  full
                  iconStart="refund"
                  disabled={!refundLegal}
                  onClick={() => setRail("refund")}
                >
                  Refund {money(order.total)}
                </Button>
                {!refundLegal && (
                  <p className="mt-1 text-[11.5px] leading-snug text-grey">
                    {refundBlocked ??
                      "A refund can only be started once the order is completed, rejected or failed. Reject the order instead to refund it automatically."}
                  </p>
                )}
              </div>
              <div>
                <Button
                  variant="destructive"
                  full
                  iconStart="cross"
                  disabled={!cancelLegal}
                  onClick={() => setRail("cancel")}
                >
                  Cancel order
                </Button>
                {!cancelLegal && (
                  <p className="mt-1 text-[11.5px] leading-snug text-grey">
                    {PROTOTYPE_RULES.cancelAfterConfirm}
                  </p>
                )}
              </div>
            </div>
            <PrototypeNote>
              Printing, messaging and refunds are simulated. Nothing leaves the prototype.
            </PrototypeNote>
          </AdminCard>

          <AdminCard title="At a glance">
            <dl>
              <DetailRow label="Placed" mono>
                {timeOf(order.placedAt)} · {relativeAge(order.placedAt, clock)}
              </DetailRow>
              <DetailRow label="Branch SLA" mono>
                {PROTOTYPE_RULES.branchSlaSeconds / 60} min
              </DetailRow>
              <DetailRow label="Quoted prep" mono>
                {branch.prepTimeMinutes} min
              </DetailRow>
              <DetailRow label="Events" mono>
                {order.events.length}
              </DetailRow>
              <DetailRow label="Lines" mono>
                {order.lines.length}
              </DetailRow>
            </dl>
          </AdminCard>
        </aside>
      </div>

      {/* ---------------- Confirmations ---------------- */}
      <ConfirmDialog
        open={rail === "kitchen"}
        onClose={() => setRail(null)}
        onConfirm={() => print(order, "kitchen")}
        title="Print the kitchen ticket?"
        confirmLabel="Send to printer"
        body={
          <>
            One ticket for <span className="num font-semibold">{order.code}</span> goes to the{" "}
            {branch.shortName} kitchen printer. The customer sees nothing. Reprinting does not change
            the order status.
          </>
        }
      />

      <ConfirmDialog
        open={rail === "receipt"}
        onClose={() => setRail(null)}
        onConfirm={() => print(order, "receipt")}
        title="Print the customer receipt?"
        confirmLabel="Send to printer"
        body={
          <>
            A receipt for {money(order.total)} prints at the {branch.shortName} counter. The customer
            keeps the copy they already have in the app — this does not resend anything to them.
          </>
        }
      />

      <ConfirmDialog
        open={rail === "resend"}
        onClose={() => setRail(null)}
        onConfirm={() => {
          resendConfirmation(order);
          recordAudit(`order.confirmation_resent · ${order.code}`);
        }}
        title="Resend the order confirmation?"
        confirmLabel="Resend confirmation"
        body={
          <>
            The customer receives the confirmation for{" "}
            <span className="num font-semibold">{order.code}</span> again at{" "}
            {order.customerEmail ?? order.customerPhone}. It repeats the current status —{" "}
            {order.status.replace(/_/g, " ").toLowerCase()} — so avoid resending while the status is
            about to change.
          </>
        }
      />

      <ConfirmDialog
        open={rail === "refund"}
        onClose={() => setRail(null)}
        destructive
        onConfirm={() => {
          advance(order, "REFUND_PENDING");
          recordAudit(`refund.started · ${order.code} · ${money(order.total)}`);
          setAnnouncement("Refund started. The customer sees refund in progress.");
        }}
        title={`Refund ${money(order.total)}?`}
        confirmLabel="Start the refund"
        body={
          <>
            The customer immediately sees “Refund in progress” with a reference. This cannot be undone
            from the console. {PROTOTYPE_RULES.refundTimingLabel}
          </>
        }
      />

      <ConfirmDialog
        open={rail === "cancel"}
        onClose={() => setRail(null)}
        destructive
        onConfirm={() => {
          setStatus(order.id, "CANCELLED", "Cancelled by branch", "branch", "Cancelled before payment completed");
          setAnnouncement("Order cancelled.");
          pushToast({
            tone: "warning",
            title: `${order.code} cancelled`,
            body: "The customer sees “Cancelled”. No payment was taken, so no refund is needed.",
          });
        }}
        title="Cancel this order?"
        confirmLabel="Cancel the order"
        body={
          <>
            {PROTOTYPE_RULES.cancelBeforePayment} The customer sees “Cancelled” straight away and no
            money is taken.
          </>
        }
      />
    </AdminShell>
  );
}