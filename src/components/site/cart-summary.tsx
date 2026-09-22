"use client";

import { useRouter } from "next/navigation";
import { branchById } from "@/lib/mock-data";
import { etaRange, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Button, Callout, Panel } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/forms";
import { TotalsBlock } from "@/components/ui/data";
import { Icon } from "@/components/ui/icons";
import { CartPromoField } from "./cart-promo-field";
import type { BranchOpenState } from "./cart-branch-strip";

/**
 * Prototype business rule: each branch sets its own minimum order value, and
 * delivery carries a higher one than pickup because a rider is involved.
 */
const MINIMUM_ORDER: Record<string, { delivery: number; pickup: number }> = {
  ss15: { delivery: 2500, pickup: 1000 },
  taylors: { delivery: 1800, pickup: 800 },
};
const FALLBACK_MINIMUM = { delivery: 2500, pickup: 1000 };

interface CheckoutGate {
  /** Null when checkout is allowed, otherwise the reason it is not. */
  reason: string | null;
  ready: boolean;
  minimum: number;
  shortfall: number;
  itemCount: number;
  blockedCount: number;
}

function useCheckoutGate(status: BranchOpenState): CheckoutGate {
  const { lines, draft, totals, branchId, sim } = useStore();
  const branch = branchById(branchId);

  const orderable = lines.filter((l) => !l.unavailableAt);
  const itemCount = orderable.reduce((n, l) => n + l.quantity, 0);
  const blockedCount = lines.length - orderable.length;

  const minimum = (MINIMUM_ORDER[branchId] ?? FALLBACK_MINIMUM)[draft.fulfilment];
  const shortfall = Math.max(0, minimum - totals.subtotal);

  let reason: string | null = null;
  if (sim.offline) {
    reason = "You are offline. Reconnect to send this order to the kitchen — your bag is saved.";
  } else if (orderable.length === 0) {
    reason = "Add at least one available dish before you check out.";
  } else if (status === null) {
    reason = "Checking today’s opening hours…";
  } else if (!status.open) {
    reason = `${branch.shortName} is closed. Ordering reopens at ${status.nextChange}.`;
  } else if (shortfall > 0) {
    reason = `Add ${money(shortfall)} more to reach the ${money(minimum)} ${draft.fulfilment} minimum at ${branch.shortName}.`;
  }

  return { reason, ready: reason === null, minimum, shortfall, itemCount, blockedCount };
}

export function CartSummary({ status }: { status: BranchOpenState }) {
  const router = useRouter();
  const { draft, patchDraft, totals, branchId } = useStore();
  const branch = branchById(branchId);
  const gate = useCheckoutGate(status);
  const isDelivery = draft.fulfilment === "delivery";

  return (
    <Panel as="section" className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="summary-title" className="text-[20px]">
          Order summary
        </h2>
        <span className="num text-[13px] text-grey" aria-live="polite">
          {gate.itemCount} item{gate.itemCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4">
        <Segmented
          full
          label="How would you like your order"
          value={draft.fulfilment}
          onChange={(v) => patchDraft({ fulfilment: v })}
          options={[
            { value: "delivery", label: "Delivery", icon: "bike" },
            { value: "pickup", label: "Pickup", icon: "bag" },
          ]}
        />
        <p className="mt-2 text-[12px] leading-snug text-grey">
          {isDelivery
            ? `Lalamove from ${branch.shortName}, roughly ${etaRange(branch, "delivery")} once the kitchen accepts.`
            : `Collect at ${branch.shortName} in about ${etaRange(branch, "pickup")}. No delivery fee on pickup.`}
        </p>
      </div>

      <CartPromoField />

      <div className="mt-4 border-t border-line pt-4">
        <TotalsBlock
          subtotal={totals.subtotal}
          discount={totals.discount}
          deliveryFee={totals.deliveryFee}
          tax={totals.tax}
          total={totals.total}
          promotionLabel={totals.promotionLabel}
          fulfilment={draft.fulfilment}
        />
      </div>

      {gate.shortfall > 0 && (
        <div className="mt-4">
          <Callout tone="warning" icon="cart" title={`${money(gate.shortfall)} below the minimum`}>
            {branch.shortName} takes {isDelivery ? "delivery" : "pickup"} orders from{" "}
            <span className="num font-semibold">{money(gate.minimum)}</span>. Add{" "}
            <span className="num font-semibold">{money(gate.shortfall)}</span> more, or switch to{" "}
            {isDelivery ? "pickup" : "delivery"} to see that minimum instead.
          </Callout>
        </div>
      )}

      {gate.blockedCount > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-snug text-grey">
          <span className="mt-px shrink-0 text-cta">
            <Icon name="alert" size={13} />
          </span>
          {gate.blockedCount} item{gate.blockedCount === 1 ? " is" : "s are"} sold out at{" "}
          {branch.shortName} and excluded from this total.
        </p>
      )}

      <div className="mt-4">
        <Button
          full
          size="lg"
          iconEnd="arrowRight"
          disabled={!gate.ready}
          onClick={() => router.push("/checkout")}
        >
          Continue to checkout
        </Button>
        <p className="mt-2 text-[12px] leading-snug text-grey" aria-live="polite">
          {gate.reason ?? "You choose delivery details and how to pay on the next step."}
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[12px] leading-snug text-grey">
        <li className="flex items-start gap-1.5">
          <span className="mt-px shrink-0 text-deep">
            <Icon name="receipt" size={13} />
          </span>
          Totals include SST at 6%. Nothing is charged until you pay.
        </li>
        <li className="flex items-start gap-1.5">
          <span className="mt-px shrink-0 text-deep">
            <Icon name="shield" size={13} />
          </span>
          Prepared in a Muslim-friendly kitchen at {branch.name}.
        </li>
        <li className="flex items-start gap-1.5">
          <span className="mt-px shrink-0 text-deep">
            <Icon name="clock" size={13} />
          </span>
          You can cancel free of charge until your payment completes.
        </li>
      </ul>
    </Panel>
  );
}

/** Sticky mobile bar. Mirrors the panel button so the total is always reachable. */
export function CartCheckoutBar({ status }: { status: BranchOpenState }) {
  const router = useRouter();
  const { totals, draft } = useStore();
  const gate = useCheckoutGate(status);

  return (
    <div className="sticky bottom-14 z-20 mt-8 border-t border-line bg-white lg:hidden">
      <div className="container-page flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="num text-[12px] text-grey">
            {gate.itemCount} item{gate.itemCount === 1 ? "" : "s"} ·{" "}
            {draft.fulfilment === "delivery" ? "Delivery" : "Pickup"}
          </p>
          <p className="num text-[19px] font-bold leading-tight text-ink">{money(totals.total)}</p>
          {gate.reason && (
            <p className="line-clamp-1 text-[11px] leading-snug text-cta">{gate.reason}</p>
          )}
        </div>
        <Button
          size="lg"
          iconEnd="arrowRight"
          disabled={!gate.ready}
          onClick={() => router.push("/checkout")}
          className="shrink-0"
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
