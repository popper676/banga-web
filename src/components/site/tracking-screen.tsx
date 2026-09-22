"use client";

/**
 * Live order tracking. Mock orders stay in their designed state so every
 * outcome is reviewable. The shopper's newly placed order (activeOrderId)
 * auto-advances according to the prototype panel.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROTOTYPE_RULES, branchById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  ErrorState,
  Panel,
  Skeleton,
  StatusBadge,
} from "@/components/ui/primitives";
import { EventTimeline, OrderLinesList, OrderTracker, TotalsBlock } from "@/components/ui/data";
import { MapView } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { scaledMs, useDelayedStep } from "./checkout-hooks";

const PIPELINE: { status: OrderStatus; label: string; actor: "kitchen" | "branch" | "rider" | "system" }[] = [
  { status: "READY", label: "Ready", actor: "kitchen" },
  { status: "LALAMOVE_BOOKED", label: "Lalamove booked", actor: "branch" },
  { status: "RIDER_PICKED_UP", label: "Picked up", actor: "rider" },
  { status: "OUT_FOR_DELIVERY", label: "On the way", actor: "rider" },
  { status: "DELIVERED", label: "Delivered", actor: "rider" },
  { status: "COMPLETED", label: "Order completed", actor: "system" },
];

const PICKUP_PIPELINE: typeof PIPELINE = [
  { status: "READY", label: "Ready for pickup", actor: "kitchen" },
  { status: "COMPLETED", label: "Collected", actor: "branch" },
];

export function TrackingScreen({ orderId }: { orderId: string }) {
  const { hydrated, orders, activeOrderId, setStatus, patchOrder, sim } = useStore();
  const delay = useDelayedStep();
  const advanced = useRef(false);
  const [itemsOpen, setItemsOpen] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!hydrated || !order || advanced.current) return;
    if (order.id !== activeOrderId) return;
    if (order.status !== "PREPARING" && order.status !== "ACCEPTED") return;
    advanced.current = true;

    if (order.status === "ACCEPTED") {
      setStatus(order.id, "PREPARING", "Kitchen started", "kitchen");
    }

    const steps = order.fulfilment === "pickup" ? PICKUP_PIPELINE : PIPELINE;
    let wait = 0;
    steps.forEach((step) => {
      wait += 8;
      delay(() => {
        if (step.status === "LALAMOVE_BOOKED" && sim.riderOutcome === "no_rider") {
          setStatus(order.id, "LALAMOVE_BOOKED", "Lalamove booked", "branch");
          delay(() => {
            setStatus(order.id, "FAILED", "No rider found — needs action", "system");
            patchOrder(order.id, {
              delivery: {
                ...(order.delivery ?? { provider: "Lalamove", fee: order.deliveryFee, status: "failed" }),
                status: "failed",
                failureReason: "No rider accepted the booking within 12 minutes",
              },
            });
          }, scaledMs(6, sim.fastForward, 900));
          return;
        }
        setStatus(order.id, step.status, step.label, step.actor);
        if (step.status === "LALAMOVE_BOOKED") {
          patchOrder(order.id, {
            delivery: {
              provider: "Lalamove",
              quotationId: "LLM-Q-PROTO",
              bookingId: "LLM-B-PROTO",
              fee: order.deliveryFee,
              status: "finding_rider",
              riderName: "Ahmad Faizal",
              riderPhone: "+60 13-662 8890",
              riderVehicle: "Yamaha NMAX",
              riderPlate: "WXY 1234",
              etaMinutes: 12,
            },
          });
        }
        if (step.status === "RIDER_PICKED_UP" || step.status === "OUT_FOR_DELIVERY") {
          patchOrder(order.id, {
            delivery: {
              ...(order.delivery ?? { provider: "Lalamove", fee: order.deliveryFee, status: "delivering" }),
              status: step.status === "OUT_FOR_DELIVERY" ? "delivering" : "picked_up",
            },
          });
        }
        if (step.status === "DELIVERED") {
          patchOrder(order.id, {
            delivery: {
              ...(order.delivery ?? { provider: "Lalamove", fee: order.deliveryFee, status: "delivered" }),
              status: "delivered",
            },
          });
        }
      }, scaledMs(wait, sim.fastForward, 700));
    });
  }, [hydrated, order, activeOrderId, delay, setStatus, patchOrder, sim.fastForward, sim.riderOutcome]);

  if (!hydrated) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-64 w-full rounded-[16px]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Order not found"
          body="Check the code on your receipt, or look the order up with your phone number."
          requestId="TRK-NF-08"
        />
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/track">Find my order</ButtonLink>
        </div>
      </div>
    );
  }

  const branch = branchById(order.branchId);
  const delivery = order.delivery;
  const riderAssigned = Boolean(delivery?.riderName);
  const failed = order.status === "FAILED";
  const refunding = order.status === "REFUND_PENDING" || order.status === "REFUNDED";
  const pickup = order.fulfilment === "pickup";
  const collection = order.code.slice(-4);

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">{order.code}</p>
          <h1 className="mt-1 text-[clamp(26px,3.5vw,40px)] leading-tight">Track your order</h1>
          <p className="mt-2 text-[15px] text-grey">
            {branch.name} · {pickup ? "Pickup" : "Delivery"}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-5">
          {!pickup && (
            <MapView
              className="h-72 w-full lg:h-80"
              label={`Live map for order ${order.code}`}
              route={Boolean(delivery && delivery.status !== "not_booked" && delivery.status !== "failed")}
              pins={[
                { x: 28, y: 72, tone: "branch", name: branch.shortName },
                ...(riderAssigned ? [{ x: 52, y: 42, tone: "rider" as const, name: delivery?.riderName ?? "Rider" }] : []),
                { x: 78, y: 22, tone: "customer", name: "You" },
              ]}
            />
          )}

          {pickup && (
            <Panel className="p-6 text-center">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-grey">Collection code</p>
              <p className="num mt-2 font-display text-[48px] font-extrabold leading-none tracking-[0.12em] text-ink">
                {collection}
              </p>
              <p className="mt-3 text-[14px] text-grey">Show this at the {branch.shortName} counter.</p>
            </Panel>
          )}

          {riderAssigned && !failed && (
            <Panel className="flex items-center gap-4 p-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-mint text-deep">
                <Icon name="bike" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{delivery?.riderName}</p>
                <p className="text-[13px] text-grey">
                  {delivery?.riderVehicle} · {delivery?.riderPlate}
                </p>
              </div>
              <ButtonLink href={`tel:${(delivery?.riderPhone ?? "").replace(/\s/g, "")}`} size="sm" variant="secondary" iconStart="phone">
                Call
              </ButtonLink>
            </Panel>
          )}

          {failed && (
            <Callout tone="danger" title="We're finding another rider">
              {delivery?.failureReason ?? "No rider accepted the booking."} You can rebook delivery, switch to pickup, or request a refund.
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm">Rebook delivery</Button>
                <Button size="sm" variant="secondary">
                  Switch to pickup
                </Button>
                <Button size="sm" variant="ghost">
                  Request refund
                </Button>
              </div>
            </Callout>
          )}

          {refunding && (
            <Callout
              tone={order.status === "REFUNDED" ? "success" : "warning"}
              title={order.status === "REFUNDED" ? "Refund completed" : "Refund in progress"}
            >
              {order.payment.refundReference && (
                <p className="num">Reference {order.payment.refundReference}</p>
              )}
              {order.payment.status === "manual_refund_required" ? (
                <p className="mt-1">
                  Refund approved — processed manually within 3–5 working days.{" "}
                  {order.payment.manualRefundReason}
                </p>
              ) : (
                <p className="mt-1">{PROTOTYPE_RULES.refundTimingLabel}</p>
              )}
            </Callout>
          )}

          <button
            type="button"
            onClick={() => setItemsOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-[14px] border border-line bg-white px-4 py-3 text-left"
            aria-expanded={itemsOpen}
          >
            <span className="font-semibold text-ink">Order items</span>
            <Icon name={itemsOpen ? "chevronDown" : "chevronRight"} size={16} />
          </button>
          {itemsOpen && (
            <Panel className="p-4">
              <OrderLinesList order={order} compact />
            </Panel>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Panel className="p-5">
            <OrderTracker
              status={order.status}
              fulfilment={order.fulfilment}
              orientation="vertical"
              events={order.events}
            />
          </Panel>
          <Panel className="p-5">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-grey">Timeline</p>
            <div className="mt-3">
              <EventTimeline events={order.events} />
            </div>
          </Panel>
          {order.address && (
            <Panel className="p-5">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-grey">Delivering to</p>
              <p className="mt-1 font-medium text-ink">{order.address.line1}</p>
              {order.address.notes && <p className="mt-1 text-[13px] text-grey">Notes: {order.address.notes}</p>}
            </Panel>
          )}
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/orders/${order.id}/receipt`} variant="secondary" iconStart="receipt">
              View receipt
            </ButtonLink>
            <ButtonLink href="/menu" variant="ghost">
              Reorder
            </ButtonLink>
            <ButtonLink href={`tel:${branch.phone.replace(/\s/g, "")}`} variant="ghost" iconStart="phone">
              Contact {branch.shortName}
            </ButtonLink>
          </div>
        </div>
      </div>

      <ReviewerStates />
    </div>
  );
}

function ReviewerStates() {
  const samples = [
    ["Waiting", "/orders/o-0138"],
    ["Preparing", "/orders/o-0137"],
    ["Out for delivery", "/orders/o-0136"],
    ["Ready for pickup", "/orders/o-0130"],
    ["Refund pending", "/orders/o-0135"],
    ["Manual refund", "/orders/o-0134"],
    ["No rider", "/orders/o-0131"],
    ["Completed", "/orders/o-0133"],
  ];
  return (
    <div className="mt-12 rounded-[14px] border border-dashed border-line bg-white p-4">
      <p className="text-[12px] font-bold uppercase tracking-wide text-grey">Reviewer · designed states</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {samples.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-mint"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
