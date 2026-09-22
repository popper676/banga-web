"use client";

/**
 * The order state machine, as operations staff see it.
 *
 * src/lib/status.ts TRANSITIONS is authoritative: a control is only offered
 * when the transition is legal from the current status. Transitions that are
 * legal in the machine but wrong for this order (booking a rider for a pickup,
 * for example) render as a disabled control with the reason spelled out.
 */

import { useState } from "react";
import { TRANSITIONS, REJECTION_REASONS } from "@/lib/status";
import { PROTOTYPE_RULES, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order, OrderEvent, OrderStatus, PaymentRecord } from "@/lib/types";
import type { IconKey } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/overlays";

export interface TransitionMeta {
  /** Button label */
  label: string;
  /** Event label written to the timeline */
  eventLabel: string;
  /** What the customer sees — shown in every confirmation dialog */
  consequence: (order: Order) => string;
  icon: IconKey;
  actor: OrderEvent["actor"];
  destructive?: boolean;
  /** Primary button on the screen where it appears */
  primary?: boolean;
}

export const TRANSITION_META: Record<OrderStatus, TransitionMeta> = {
  PENDING_PAYMENT: {
    label: "Return to pending payment",
    eventLabel: "Returned to pending payment",
    consequence: () =>
      "The customer is asked to pay again and can cancel the order until payment completes.",
    icon: "clock",
    actor: "system",
  },
  PAID: {
    label: "Record payment",
    eventLabel: "Payment recorded manually",
    consequence: (o) =>
      `The customer sees “Payment received” for ${money(o.total)} and the order moves into the branch queue.`,
    icon: "card",
    actor: "system",
  },
  WAITING_FOR_BRANCH: {
    label: "Send to branch",
    eventLabel: "Sent to branch",
    consequence: (o) =>
      `${branchById(o.branchId).shortName} gets 5 minutes to accept. If nobody responds the order is auto-rejected and refunded.`,
    icon: "hourglass",
    actor: "system",
  },
  ACCEPTED: {
    label: "Accept order",
    eventLabel: "Accepted by branch",
    consequence: (o) =>
      `The customer sees “Order confirmed” with an estimated ${branchById(o.branchId).prepTimeMinutes} minute prep time and can no longer cancel.`,
    icon: "check",
    actor: "branch",
    primary: true,
  },
  REJECTED: {
    label: "Reject order",
    eventLabel: "Rejected by branch",
    consequence: (o) =>
      `The customer sees “Order declined” and a refund of ${money(o.total)} is initiated straight away. ${PROTOTYPE_RULES.refundTimingLabel}`,
    icon: "cross",
    actor: "branch",
    destructive: true,
  },
  PREPARING: {
    label: "Start preparing",
    eventLabel: "Kitchen started",
    consequence: () => "The customer tracker moves to “Cooking now”.",
    icon: "cook",
    actor: "kitchen",
    primary: true,
  },
  READY: {
    label: "Mark ready",
    eventLabel: "Ready",
    consequence: (o) =>
      o.fulfilment === "pickup"
        ? "The customer is told the order is ready for pickup at the counter."
        : "The customer sees “Ready” and the branch can book a Lalamove rider.",
    icon: "bag",
    actor: "kitchen",
    primary: true,
  },
  LALAMOVE_BOOKED: {
    label: "Book Lalamove rider",
    eventLabel: "Lalamove booked",
    consequence: () =>
      "The customer sees “Finding your rider”. The delivery fee is already paid, so a failed booking has to be re-booked or refunded.",
    icon: "bike",
    actor: "branch",
    primary: true,
  },
  RIDER_PICKED_UP: {
    label: "Rider picked up",
    eventLabel: "Rider picked up the order",
    consequence: () => "The customer sees “Picked up” with the rider's name and plate number.",
    icon: "bike",
    actor: "rider",
    primary: true,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    eventLabel: "On the way",
    consequence: () => "The customer sees “On the way” with a live estimated arrival.",
    icon: "bike",
    actor: "rider",
    primary: true,
  },
  DELIVERED: {
    label: "Mark delivered",
    eventLabel: "Delivered",
    consequence: () => "The customer sees “Delivered” and is asked to rate the order.",
    icon: "pin",
    actor: "rider",
    primary: true,
  },
  COMPLETED: {
    label: "Complete order",
    eventLabel: "Order completed",
    consequence: () => "The order closes and moves into reporting. The customer sees “Completed”.",
    icon: "check-double",
    actor: "branch",
    primary: true,
  },
  REFUND_PENDING: {
    label: "Start refund",
    eventLabel: "Refund initiated",
    consequence: (o) =>
      `The customer sees “Refund in progress” for ${money(o.total)} with a reference. ${PROTOTYPE_RULES.refundTimingLabel}`,
    icon: "refund",
    actor: "system",
    destructive: true,
  },
  REFUNDED: {
    label: "Mark refund completed",
    eventLabel: "Refund completed",
    consequence: (o) => `The customer sees “Refunded” and ${money(o.total)} is shown as returned.`,
    icon: "refund",
    actor: "system",
  },
  FAILED: {
    label: "Mark as failed",
    eventLabel: "Marked as failed",
    consequence: () =>
      "The customer sees “Something went wrong” and is told the branch will call. A refund still has to be started manually.",
    icon: "alert",
    actor: "system",
    destructive: true,
  },
  CANCELLED: {
    label: "Cancel order",
    eventLabel: "Cancelled",
    consequence: () =>
      "The order stops immediately. Cancellation is only allowed before payment completes — after that a refund is required instead.",
    icon: "cross",
    actor: "branch",
    destructive: true,
  },
};

export interface NextAction {
  status: OrderStatus;
  meta: TransitionMeta;
  /** When set the control renders disabled and shows this reason. */
  disabledReason?: string;
}

/** Every transition the machine allows from this order's status. */
export function nextActions(order: Order): NextAction[] {
  const allowed = TRANSITIONS[order.status] ?? [];
  return allowed.map((status) => ({
    status,
    meta: TRANSITION_META[status],
    disabledReason: blockedReason(order, status),
  }));
}

/** Legal in the machine, wrong for this particular order. */
export function blockedReason(order: Order, target: OrderStatus): string | undefined {
  if (target === "LALAMOVE_BOOKED" && order.fulfilment === "pickup") {
    return "This is a pickup order — there is no delivery to book.";
  }
  if (target === "COMPLETED" && order.status === "READY" && order.fulfilment === "delivery") {
    return "A delivery order completes after the rider marks it delivered.";
  }
  if (target === "REFUNDED" && order.payment.status === "manual_refund_required") {
    return `${order.payment.provider} cannot reverse this payment automatically. Finance must transfer the refund and record the bank reference.`;
  }
  if (target === "CANCELLED" && order.status !== "PENDING_PAYMENT") {
    return PROTOTYPE_RULES.cancelAfterConfirm;
  }
  return undefined;
}

/**
 * Side effects that belong with a status change: payment record, delivery
 * record and the rejection reason.
 */
function sideEffects(
  order: Order,
  status: OrderStatus,
  refundMode: "auto" | "manual",
  riderOutcome: "normal" | "no_rider",
): Partial<Order> {
  const shortRef = order.code.slice(-4);

  if (status === "REJECTED") {
    return {
      rejectionReason: order.rejectionReason ?? REJECTION_REASONS[0],
    };
  }

  if (status === "REFUND_PENDING") {
    const manual = refundMode === "manual" || order.payment.method === "duitnow_qr";
    const payment: PaymentRecord = {
      ...order.payment,
      status: manual ? "manual_refund_required" : "refund_pending",
      refundReference: manual
        ? `${order.payment.provider === "OXPay" ? "OXP" : "MBB"}-RF-MANUAL-${shortRef}`
        : `MBB-RF-${shortRef}`,
      refundRequestedAt: new Date().toISOString(),
      refundNote: manual
        ? undefined
        : `Reversal submitted to ${order.payment.provider}. ${PROTOTYPE_RULES.refundTimingLabel}`,
      manualRefundReason: manual
        ? `${order.payment.provider} does not support an automated reversal for this transaction type. Finance must refund manually and record the bank reference.`
        : undefined,
    };
    return { payment };
  }

  if (status === "REFUNDED") {
    return {
      payment: {
        ...order.payment,
        status: "refunded",
        refundCompletedAt: new Date().toISOString(),
      },
    };
  }

  if (status === "LALAMOVE_BOOKED") {
    return {
      delivery: {
        provider: "Lalamove",
        quotationId: order.delivery?.quotationId ?? `LLM-Q-${shortRef}`,
        bookingId: `LLM-B-${shortRef}`,
        fee: order.deliveryFee,
        status: riderOutcome === "no_rider" ? "finding_rider" : "assigned",
        riderName: riderOutcome === "no_rider" ? undefined : "Ahmad Faizal",
        riderPhone: riderOutcome === "no_rider" ? undefined : "+60 13-662 8890",
        riderVehicle: riderOutcome === "no_rider" ? undefined : "Yamaha NMAX",
        riderPlate: riderOutcome === "no_rider" ? undefined : "WXY 1234",
        etaMinutes: riderOutcome === "no_rider" ? undefined : 14,
      },
    };
  }

  if (status === "RIDER_PICKED_UP" && order.delivery) {
    return { delivery: { ...order.delivery, status: "picked_up" } };
  }
  if (status === "OUT_FOR_DELIVERY" && order.delivery) {
    return { delivery: { ...order.delivery, status: "delivering" } };
  }
  if (status === "DELIVERED" && order.delivery) {
    return { delivery: { ...order.delivery, status: "delivered", etaMinutes: 0 } };
  }
  if (status === "FAILED" && order.delivery) {
    return {
      delivery: {
        ...order.delivery,
        status: "failed",
        failureReason: order.delivery.failureReason ?? "No rider accepted the booking",
      },
    };
  }

  return {};
}

/** Shared operations actions. Every one of them is simulated. */
export function useOrderOps() {
  const { setStatus, patchOrder, pushToast, sim } = useStore();

  function advance(order: Order, status: OrderStatus, note?: string) {
    const meta = TRANSITION_META[status];
    const patch = sideEffects(order, status, sim.refundMode, sim.riderOutcome);
    if (Object.keys(patch).length > 0) patchOrder(order.id, patch);
    setStatus(order.id, status, meta.eventLabel, meta.actor, note);
    pushToast({
      tone: meta.destructive ? "warning" : "success",
      title: `${order.code} · ${meta.eventLabel}`,
      body: meta.consequence(order),
    });
  }

  function reject(order: Order, reason: string, detail?: string, auto = false) {
    patchOrder(order.id, { rejectionReason: reason });
    setStatus(
      order.id,
      "REJECTED",
      auto ? "Auto-rejected — no branch response in 5 min" : `Rejected — ${reason.toLowerCase()}`,
      auto ? "system" : "branch",
      detail,
    );
    const manual = sim.refundMode === "manual" || order.payment.method === "duitnow_qr";
    patchOrder(order.id, sideEffects(order, "REFUND_PENDING", sim.refundMode, sim.riderOutcome));
    setStatus(
      order.id,
      "REFUND_PENDING",
      manual ? "Manual refund required" : `Refund initiated · ${money(order.total)}`,
      "system",
    );
    pushToast({
      tone: "warning",
      title: `${order.code} rejected`,
      body: manual
        ? `${order.payment.provider} cannot reverse this automatically — Finance has to refund ${money(order.total)} manually.`
        : `${money(order.total)} refund initiated automatically. ${PROTOTYPE_RULES.refundTimingLabel}`,
    });
  }

  function print(order: Order, kind: "kitchen" | "receipt") {
    pushToast({
      tone: "neutral",
      title: kind === "kitchen" ? "Kitchen ticket sent" : "Receipt sent to the counter printer",
      body: `${order.code} → ${branchById(order.branchId).shortName} printer. Prototype only — nothing is actually printed.`,
    });
  }

  function resendConfirmation(order: Order) {
    pushToast({
      tone: "success",
      title: "Confirmation resent",
      body: `Order ${order.code} confirmation sent to ${order.customerEmail ?? order.customerPhone}. Simulated — no message leaves the prototype.`,
    });
  }

  return { advance, reject, print, resendConfirmation, sim };
}

/* ------------------------------------------------------------------ */
/* Action bar                                                          */
/* ------------------------------------------------------------------ */

export function OrderActionBar({
  order,
  size = "sm",
  layout = "row",
  onDone,
}: {
  order: Order;
  size?: "sm" | "md";
  layout?: "row" | "column";
  onDone?: (status: OrderStatus) => void;
}) {
  const { advance } = useOrderOps();
  const [pending, setPending] = useState<NextAction | null>(null);
  const actions = nextActions(order);

  if (actions.length === 0) {
    return (
      <p className="flex items-center gap-1.5 rounded-[10px] border border-line bg-cream/70 px-3 py-2 text-[12.5px] text-grey">
        No further status change is possible from{" "}
        <span className="font-semibold text-ink">{order.status.replace(/_/g, " ").toLowerCase()}</span>.
      </p>
    );
  }

  return (
    <>
      <div className={layout === "row" ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2"}>
        {actions.map((a) => (
          <div key={a.status} className={layout === "column" ? "w-full" : undefined}>
            <Button
              size={size}
              full={layout === "column"}
              variant={a.meta.destructive ? "destructive" : a.meta.primary ? "primary" : "secondary"}
              iconStart={a.meta.icon}
              disabled={Boolean(a.disabledReason)}
              title={a.disabledReason}
              aria-describedby={a.disabledReason ? `why-${order.id}-${a.status}` : undefined}
              onClick={() => setPending(a)}
            >
              {a.meta.label}
            </Button>
            {a.disabledReason && (
              <p
                id={`why-${order.id}-${a.status}`}
                className="mt-1 flex items-start gap-1 text-[11.5px] leading-snug text-grey"
              >
                <span aria-hidden>·</span>
                {a.disabledReason}
              </p>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          advance(order, pending.status);
          onDone?.(pending.status);
        }}
        destructive={pending?.meta.destructive}
        title={pending ? `${pending.meta.label}?` : ""}
        confirmLabel={pending ? pending.meta.label : "Confirm"}
        cancelLabel="Keep as is"
        body={
          <div className="flex flex-col gap-2">
            <p>
              <span className="num font-semibold text-ink">{order.code}</span> ·{" "}
              {order.customerName} · {money(order.total)}
            </p>
            <p className="font-semibold text-ink">What the customer will see</p>
            <p>{pending?.meta.consequence(order)}</p>
          </div>
        }
      />
    </>
  );
}