"use client";

/**
 * Branch confirmation — the highest-anxiety moment after payment.
 * Simulated: accept / reject / 5-minute timeout are driven by the prototype panel.
 */

import { useEffect, useRef } from "react";
import { PROTOTYPE_RULES, branchById } from "@/lib/mock-data";
import { REJECTION_REASONS } from "@/lib/status";
import { countdown, money } from "@/lib/format";
import { canCustomerCancel } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";
import { Badge, ButtonLink, Callout, ErrorState, Panel, Skeleton } from "@/components/ui/primitives";
import { OrderLinesList, OrderTracker, TotalsBlock } from "@/components/ui/data";
import { Icon } from "@/components/ui/icons";
import { clockLabel, scaledMs, useCountdown, useDelayedStep } from "./checkout-hooks";

export function ConfirmationScreen({ orderId }: { orderId: string | null }) {
  const { hydrated, orders, patchOrder, setStatus, sim, pushToast } = useStore();
  const delay = useDelayedStep();
  const ran = useRef(false);

  const order = orderId ? orders.find((o) => o.id === orderId) : undefined;
  const waiting = order?.status === "WAITING_FOR_BRANCH" || order?.status === "PAID";
  const remaining = useCountdown({
    seconds: PROTOTYPE_RULES.branchSlaSeconds,
    fastForward: sim.fastForward,
    running: Boolean(waiting),
    onComplete: () => {
      /* timeout is handled in the effect so we have the latest order */
    },
  });

  useEffect(() => {
    if (!hydrated || !order || ran.current) return;
    if (order.status !== "WAITING_FOR_BRANCH" && order.status !== "PAID") return;
    ran.current = true;

    if (order.status === "PAID") {
      setStatus(order.id, "WAITING_FOR_BRANCH", `Sent to ${branchById(order.branchId).shortName}`);
    }

    if (sim.branchResponse === "accept") {
      delay(() => {
        setStatus(order.id, "ACCEPTED", `Accepted by ${branchById(order.branchId).shortName}`, "branch");
        delay(() => {
          setStatus(order.id, "PREPARING", "Kitchen started", "kitchen");
          pushToast({ tone: "success", title: "The kitchen has your order" });
        }, scaledMs(4, sim.fastForward, 800));
      }, scaledMs(8, sim.fastForward, 1400));
      return;
    }

    if (sim.branchResponse === "reject") {
      delay(() => {
        const reason = REJECTION_REASONS[0];
        patchOrder(order.id, { rejectionReason: reason });
        setStatus(order.id, "REJECTED", `Rejected — ${reason}`, "branch");
        const manual = sim.refundMode === "manual";
        setStatus(
          order.id,
          "REFUND_PENDING",
          manual ? "Manual refund required" : "Refund initiated",
        );
        patchOrder(order.id, {
          payment: {
            ...order.payment,
            status: manual ? "manual_refund_required" : "refund_pending",
            refundReference: manual ? `OXP-RF-PENDING` : `MBB-RF-${order.code.slice(-4)}`,
            refundRequestedAt: new Date().toISOString(),
            refundNote: PROTOTYPE_RULES.refundTimingLabel,
            manualRefundReason: manual
              ? `${order.payment.provider} cannot reverse this transaction automatically. Finance will transfer the refund and record the bank reference.`
              : undefined,
          },
        });
      }, scaledMs(6, sim.fastForward, 1200));
      return;
    }

    /* timeout — wait for the SLA clock */
    delay(() => {
      patchOrder(order.id, {
        rejectionReason: "Branch did not respond within 5 minutes (prototype rule)",
      });
      setStatus(order.id, "REJECTED", "Auto-rejected — no branch response in 5 min", "system");
      const manual = sim.refundMode === "manual" || order.payment.method === "duitnow_qr";
      setStatus(order.id, "REFUND_PENDING", manual ? "Manual refund required" : "Refund initiated");
      patchOrder(order.id, {
        payment: {
          ...order.payment,
          status: manual ? "manual_refund_required" : "refund_pending",
          refundReference: manual ? "OXP-RF-PENDING" : `MBB-RF-${order.code.slice(-4)}`,
          refundRequestedAt: new Date().toISOString(),
          refundNote: PROTOTYPE_RULES.refundTimingLabel,
          manualRefundReason: manual
            ? `${order.payment.provider} cannot reverse this transaction automatically.`
            : undefined,
        },
      });
    }, scaledMs(PROTOTYPE_RULES.branchSlaSeconds, sim.fastForward, 1800));
  }, [hydrated, order, sim.branchResponse, sim.fastForward, sim.refundMode, delay, setStatus, patchOrder, pushToast]);

  if (!hydrated) {
    return (
      <div className="container-page py-16">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto mt-6 h-40 max-w-xl" />
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="We could not find that order"
          body="The confirmation link may have expired, or this browser has not created the order yet. Place the order again from the cart."
          requestId="CONF-NF-19"
        />
        <div className="mt-6 flex justify-center gap-2">
          <ButtonLink href="/cart" variant="secondary">
            Back to cart
          </ButtonLink>
          <ButtonLink href="/track">Find an order</ButtonLink>
        </div>
      </div>
    );
  }

  return <ConfirmationBody order={order} remaining={remaining} />;
}

function ConfirmationBody({ order, remaining }: { order: Order; remaining: number }) {
  const { sim } = useStore();
  const branch = branchById(order.branchId);
  const waiting = order.status === "WAITING_FOR_BRANCH" || order.status === "PAID";
  const accepted = order.status === "ACCEPTED" || order.status === "PREPARING" || order.status === "READY";
  const rejected =
    order.status === "REJECTED" ||
    order.status === "REFUND_PENDING" ||
    order.status === "REFUNDED";
  const other = branch.id === "ss15" ? "taylors" : "ss15";
  const otherName = branchById(other).shortName;
  const live = !sim.offline;

  return (
    <div className="container-page max-w-3xl py-10 lg:py-14">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">
        {order.code}
      </p>
      <h1 className="mt-2 text-[clamp(28px,4vw,44px)] leading-[1.05]">
        {waiting && "Waiting for the branch"}
        {accepted && "Order confirmed"}
        {rejected && "This order was declined"}
        {!waiting && !accepted && !rejected && "Payment received"}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="success" icon="check" soft>
          Payment received · {money(order.total)}
        </Badge>
        <Badge tone={live ? "info" : "warning"} icon={live ? "sparkle" : "wifiOff"} soft>
          {live ? "Live updates on" : "Checking every 10 seconds"}
        </Badge>
      </div>

      {waiting && (
        <Panel className="mt-8 p-6 text-center">
          <span className="pulse-dot mx-auto mb-3 block size-3 rounded-full bg-deep" />
          <p className="text-[18px] font-semibold text-ink">
            Waiting for {branch.shortName} to confirm your order
          </p>
          <p className="mt-1 text-[14px] text-grey">Usually under 5 minutes</p>
          <p className="num mt-4 font-display text-[44px] font-extrabold leading-none text-ink">
            {countdown(remaining)}
          </p>
          <p className="mt-2 text-[12px] font-medium text-grey">left in the response window</p>
        </Panel>
      )}

      {accepted && (
        <Callout tone="success" title="The kitchen has your order" className="mt-8" icon="cook">
          {branch.shortName} accepted at {clockLabel()}. Estimated ready in {branch.prepTimeMinutes}–
          {branch.prepTimeMinutes + 8} minutes.
        </Callout>
      )}

      {rejected && (
        <Callout tone="danger" title={`${branch.shortName} couldn't take this order`} className="mt-8">
          <p>Reason: {order.rejectionReason ?? "The kitchen is too busy to take this order"}.</p>
          <p className="mt-2">
            Refund of {money(order.total)} started
            {order.payment.refundReference ? ` · ref ${order.payment.refundReference}` : ""}.
          </p>
          {order.payment.status === "manual_refund_required" ? (
            <p className="mt-2">
              Refund approved — processed manually within 3–5 working days.{" "}
              {order.payment.manualRefundReason}
            </p>
          ) : (
            <p className="mt-2">{PROTOTYPE_RULES.refundTimingLabel}</p>
          )}
        </Callout>
      )}

      <div className="mt-8">
        <OrderTracker status={order.status} fulfilment={order.fulfilment} events={order.events} />
      </div>

      <Panel className="mt-8 p-5">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-grey">Your order</p>
        <p className="mt-1 text-[14px] text-ink">
          {order.lines.reduce((n, l) => n + l.quantity, 0)} items ·{" "}
          {order.fulfilment === "delivery" ? `Delivery to ${order.address?.line1}` : `Pickup at ${branch.shortName}`}
        </p>
        <div className="mt-4">
          <OrderLinesList order={order} compact />
        </div>
        <div className="mt-4 border-t border-line pt-3">
          <TotalsBlock
            subtotal={order.subtotal}
            discount={order.discount}
            deliveryFee={order.deliveryFee}
            tax={order.tax}
            total={order.total}
            promotionLabel={order.promotionCode}
            fulfilment={order.fulfilment}
            compact
          />
        </div>
      </Panel>

      <Callout tone="info" title="Prototype business rule" className="mt-6">
        {PROTOTYPE_RULES.branchSlaLabel} Use the prototype panel to switch Accept / Reject / 5-min.
      </Callout>

      {canCustomerCancel(order.status) ? (
        <p className="mt-4 text-[14px] text-grey">{PROTOTYPE_RULES.cancelBeforePayment}</p>
      ) : (
        <Callout tone="neutral" icon="lock" className="mt-6">
          {PROTOTYPE_RULES.cancelAfterConfirm}
        </Callout>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <ButtonLink href={`tel:${branch.phone.replace(/\s/g, "")}`} variant="secondary" iconStart="phone">
          Call {branch.shortName}
        </ButtonLink>
        {accepted && (
          <ButtonLink href={`/orders/${order.id}`} iconEnd="arrowRight">
            Track your order
          </ButtonLink>
        )}
        {rejected && (
          <>
            <ButtonLink href={`/menu?branch=${other}`}>Order from {otherName}</ButtonLink>
            <ButtonLink href="/menu" variant="secondary">
              Back to menu
            </ButtonLink>
          </>
        )}
        <ButtonLink href={`/orders/${order.id}/receipt`} variant="ghost" iconStart="receipt">
          View receipt
        </ButtonLink>
      </div>
    </div>
  );
}
