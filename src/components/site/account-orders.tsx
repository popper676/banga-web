"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { branchById, productById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge, Button, ButtonLink, EmptyState, Panel, StatusBadge } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/forms";
import { ConfirmDialog } from "@/components/ui/overlays";
import { AccountHeader, AccountSignedOut, AccountSkeleton, formatDateTime } from "./account-shell";

const LIVE: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "WAITING_FOR_BRANCH",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "LALAMOVE_BOOKED",
  "RIDER_PICKED_UP",
  "OUT_FOR_DELIVERY",
];

export function AccountOrders() {
  const router = useRouter();
  const { hydrated, sim, orders, branchId, addLine, pushToast, clearCart } = useStore();
  const [tab, setTab] = useState<"active" | "past">("active");
  const [reorder, setReorder] = useState<Order | null>(null);

  const mine = useMemo(
    () => orders.filter((o) => o.customerName === "Aisyah Rahman" || !o.isGuest),
    [orders],
  );
  const active = mine.filter((o) => LIVE.includes(o.status));
  const past = mine.filter((o) => !LIVE.includes(o.status));
  const list = tab === "active" ? active : past;

  if (!hydrated) return <AccountSkeleton />;
  if (!sim.signedIn) {
    return (
      <div className="container-page py-10">
        <AccountHeader title="Order history" lead="Receipts, refunds and reorder." />
        <AccountSignedOut body="Sign in to keep a history. Guests can still track with the order code." />
      </div>
    );
  }

  const confirmReorder = () => {
    if (!reorder) return;
    clearCart();
    reorder.lines.forEach((l) => {
      addLine({
        productId: l.productId,
        name: l.name,
        image: l.image,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        options: l.options,
        notes: l.notes,
        unavailableAt: productById(l.productId)?.availability[branchId] === "sold_out" ? branchId : undefined,
      });
    });
    pushToast({ tone: "success", title: "Cart rebuilt from this order" });
    setReorder(null);
    router.push("/cart");
  };

  const unavailable = reorder
    ? reorder.lines.filter((l) => productById(l.productId)?.availability[branchId] === "sold_out")
    : [];

  return (
    <div className="container-page py-10 lg:py-12">
      <AccountHeader
        title="Order history"
        lead="Track live orders, open receipts and rebuild a cart from a past meal."
      />

      <div className="mt-6">
        <Segmented
          label="Order list"
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: `Active (${active.length})` },
            { value: "past", label: `Past (${past.length})` },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="receipt"
            title={tab === "active" ? "No live orders" : "No orders yet"}
            body={tab === "active" ? "When you place an order it will sit here until it is completed." : "Explore the menu — sets start under RM20."}
            action={<ButtonLink href="/menu">Explore the menu</ButtonLink>}
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((o) => (
            <li key={o.id}>
              <Panel className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="num font-semibold text-ink">{o.code}</p>
                    <StatusBadge status={o.status} />
                    <Badge soft tone="neutral">
                      {o.fulfilment === "delivery" ? "Delivery" : "Pickup"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-grey">
                    {formatDateTime(o.placedAt)} · {branchById(o.branchId).shortName} ·{" "}
                    {o.lines.map((l) => l.name).join(", ")}
                  </p>
                </div>
                <p className="num font-bold text-ink">{money(o.total)}</p>
                <div className="flex flex-wrap gap-2">
                  {LIVE.includes(o.status) && (
                    <ButtonLink href={`/orders/${o.id}`} size="sm">
                      Track
                    </ButtonLink>
                  )}
                  <ButtonLink href={`/orders/${o.id}/receipt`} size="sm" variant="secondary">
                    Receipt
                  </ButtonLink>
                  <Button size="sm" variant="ghost" onClick={() => setReorder(o)}>
                    Reorder
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(reorder)}
        onClose={() => setReorder(null)}
        onConfirm={confirmReorder}
        title="Rebuild this order?"
        confirmLabel="Go to cart"
        body={
          unavailable.length > 0 ? (
            <p>
              {unavailable.map((l) => l.name).join(", ")} {unavailable.length === 1 ? "is" : "are"} sold
              out at {branchById(branchId).shortName} and will be flagged in the cart. Prices are
              rechecked at checkout.
            </p>
          ) : (
            <p>Everything is available at {branchById(branchId).shortName}. Your current cart will be replaced.</p>
          )
        }
      />
    </div>
  );
}
