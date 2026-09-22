"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { branchById, productById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Callout, Panel, Skeleton } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import {
  CartBranchStrip,
  CartClosedNotice,
  useBranchOpenState,
} from "./cart-branch-strip";
import { CartCheckoutBar, CartSummary } from "./cart-summary";
import { CartEmpty } from "./cart-empty";
import { CartLineItem } from "./cart-line-item";
import { CartUpsellRail } from "./cart-upsell-rail";

export function CartScreen() {
  const { hydrated, lines, branchId, markUnavailable, cartCount, totals, sim } = useStore();
  const status = useBranchOpenState(branchId);
  const branch = branchById(branchId);

  /* ---- revalidate the bag against the branch that is actually selected ---- */
  const soldOutLineIds = useMemo(
    () =>
      lines
        .filter(
          (l) => (productById(l.productId)?.availability[branchId] ?? "available") === "sold_out",
        )
        .map((l) => l.lineId),
    [lines, branchId],
  );

  useEffect(() => {
    if (!hydrated) return;
    const flagged = lines.filter((l) => l.unavailableAt).map((l) => l.lineId);
    const unchanged =
      flagged.length === soldOutLineIds.length && flagged.every((id) => soldOutLineIds.includes(id));
    if (!unchanged) markUnavailable(soldOutLineIds, branchId);
  }, [hydrated, lines, soldOutLineIds, branchId, markUnavailable]);

  if (!hydrated) return <CartSkeleton />;

  const blocked = lines.filter((l) => l.unavailableAt);

  return (
    <div className="pb-4">
      <div className="container-page py-8 lg:py-12">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-deep">Your order</p>
        <h1 className="mt-2 text-[clamp(32px,4.6vw,56px)] leading-[1.02]">YOUR BAG</h1>
        <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-grey">
          Check the dishes, the branch and the total before you pay. Everything here is held on this
          device — no order reaches a kitchen until you complete checkout.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {sim.offline && (
            <Callout tone="danger" icon="wifiOff" title="You’re offline" role="alert">
              Your bag is saved on this device, but checkout needs a connection so we can hold a
              slot at {branch.shortName} and price the delivery.
            </Callout>
          )}
          <CartBranchStrip status={status} />
          <CartClosedNotice status={status} />
        </div>

        {lines.length === 0 ? (
          <div className="mt-10">
            <CartEmpty />
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:gap-10">
            <div className="min-w-0">
              <section aria-labelledby="items-title">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 id="items-title" className="text-[22px]">
                    Items in your bag
                  </h2>
                  <p className="num text-[13px] text-grey" aria-live="polite">
                    {cartCount} item{cartCount === 1 ? "" : "s"} · {money(totals.subtotal)} subtotal
                  </p>
                </div>

                {blocked.length > 0 && (
                  <div className="mt-3">
                    <Callout
                      tone="warning"
                      title={`${blocked.length} item${blocked.length === 1 ? "" : "s"} unavailable at ${branch.shortName}`}
                    >
                      Stock is set per branch each morning. Remove the flagged lines, swap them for
                      something similar, or{" "}
                      <Link href="/locations" className="font-semibold underline underline-offset-2">
                        order from the other branch
                      </Link>{" "}
                      instead. They are already excluded from your total.
                    </Callout>
                  </div>
                )}

                <Panel className="mt-4 px-4">
                  <ul className="flex flex-col">
                    {lines.map((line) => (
                      <CartLineItem key={line.lineId} line={line} />
                    ))}
                  </ul>
                </Panel>

                <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-grey">
                  <span className="mt-px shrink-0 text-deep">
                    <Icon name="shield" size={13} />
                  </span>
                  Allergen information sits on each dish page. Tell us about an allergy in the note
                  for the kitchen and the branch will see it on the ticket.
                </p>
              </section>

              <CartUpsellRail />
            </div>

            <aside aria-labelledby="summary-title" className="lg:sticky lg:top-24 lg:self-start">
              <CartSummary status={status} />
            </aside>
          </div>
        )}
      </div>

      {lines.length > 0 && <CartCheckoutBar status={status} />}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-11 w-64" />
      <Skeleton className="mt-4 h-4 w-full max-w-[52ch]" />
      <Skeleton className="mt-6 h-20 w-full rounded-[16px]" />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:gap-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full rounded-[16px]" />
          <Skeleton className="h-40 w-full rounded-[16px]" />
        </div>
        <Skeleton className="h-[26rem] w-full rounded-[16px]" />
      </div>
      <p className="sr-only" aria-live="polite">
        Loading your bag.
      </p>
    </div>
  );
}
