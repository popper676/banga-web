"use client";

import { AdminShell } from "@/components/admin/shell";
import { ElapsedBadge, FulfilmentTag, itemSummary, minutesSince, timeOf, useOpsClock } from "@/components/admin/ops-shared";
import { branchById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/format";

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: "ACCEPTED", title: "Confirmed" },
  { id: "PREPARING", title: "Preparing" },
  { id: "READY", title: "Ready" },
];

export function KitchenBoard() {
  const { orders, setStatus, pushToast } = useStore();
  const now = useOpsClock(5000);
  const clock = now ?? Date.parse("2026-09-21T19:08:00+08:00");
  const cards = (s: OrderStatus) => orders.filter((o) => o.status === s);

  const bump = (o: Order) => {
    if (o.status === "ACCEPTED") setStatus(o.id, "PREPARING", "Kitchen started", "kitchen");
    else if (o.status === "PREPARING") setStatus(o.id, "READY", "Ready", "kitchen");
    else if (o.status === "READY" && o.fulfilment === "pickup") {
      setStatus(o.id, "COMPLETED", "Collected", "branch");
      pushToast({ tone: "success", title: `${o.code} handed over` });
    }
  };

  return (
    <AdminShell
      title="Kitchen status"
      description="Glanceable board from confirmed through to handed over. Designed to work on a phone behind the counter."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const rows = cards(col.id);
          return (
            <section key={col.id} className="rounded-[14px] border border-line bg-white p-3">
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-[15px]">{col.title}</h2>
                <Badge soft tone="neutral">
                  {rows.length}
                </Badge>
              </header>
              {rows.length === 0 ? (
                <EmptyState icon="cook" title="Clear" compact />
              ) : (
                <ul className="flex flex-col gap-2">
                  {rows.map((o) => (
                    <li
                      key={o.id}
                      className={cn(
                        "rounded-[12px] border p-3",
                        col.id === "READY" ? "border-deep bg-mint" : "border-line bg-cream/60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="num font-bold text-ink">{o.code.slice(-4)}</p>
                        <ElapsedBadge
                          minutes={minutesSince(o.placedAt, clock)}
                          targetMinutes={branchById(o.branchId).prepTimeMinutes}
                        />
                      </div>
                      <p className="mt-1 text-[13px] text-ink">{itemSummary(o)}</p>
                      <p className="mt-1 text-[12px] text-grey">
                        {timeOf(o.placedAt)} · {branchById(o.branchId).shortName}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <FulfilmentTag type={o.fulfilment} />
                        <Button
                          size="sm"
                          disabled={col.id === "READY" && o.fulfilment === "delivery"}
                          onClick={() => bump(o)}
                        >
                          {col.id === "READY"
                            ? o.fulfilment === "pickup"
                              ? "Handed over"
                              : "Waiting for rider"
                            : "Next"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
