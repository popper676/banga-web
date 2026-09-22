"use client";

import type { ReactNode } from "react";
import { cn, money } from "@/lib/format";
import { DELIVERY_STEPS, ORDER_STATUS, PICKUP_STEPS } from "@/lib/status";
import type { FulfilmentType, Order, OrderEvent, OrderStatus } from "@/lib/types";
import { Icon, type IconKey } from "./icons";

/* ------------------------------------------------------------------ */
/* Admin table                                                         */
/* ------------------------------------------------------------------ */

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render: (row: T) => ReactNode;
  hideAtLaptop?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  emptyTitle = "No results",
  emptyBody,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  emptyTitle?: string;
  emptyBody?: string;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-cream/60">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{ width: c.width }}
                className={cn(
                  "px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-grey",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  c.hideAtLaptop && "hidden xl:table-cell",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <p className="text-[15px] font-semibold text-ink">{emptyTitle}</p>
                {emptyBody && <p className="mt-1 text-[13px] text-grey">{emptyBody}</p>}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-line/70 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-mint/50",
                  selectedId === row.id && "bg-mint",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3.5 align-middle text-[14px] text-ink",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.hideAtLaptop && "hidden xl:table-cell",
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 pt-3"
      aria-label="Pagination"
    >
      <p className="num text-[13px] text-grey">
        Page {page} of {pages} · {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink disabled:opacity-35 hover:bg-mint"
          aria-label="Previous page"
        >
          <Icon name="chevronLeft" size={16} />
        </button>
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            aria-current={page === i + 1 ? "page" : undefined}
            className={cn(
              "num size-9 rounded-full text-[13px] font-semibold",
              page === i + 1 ? "bg-ink text-white" : "text-ink hover:bg-mint",
            )}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink disabled:opacity-35 hover:bg-mint"
          aria-label="Next page"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Customer order tracker — 5 steps delivery, 4 steps pickup           */
/* ------------------------------------------------------------------ */

export function OrderTracker({
  status,
  fulfilment,
  orientation = "horizontal",
  events,
}: {
  status: OrderStatus;
  fulfilment: FulfilmentType;
  orientation?: "horizontal" | "vertical";
  events?: OrderEvent[];
}) {
  const steps = fulfilment === "delivery" ? DELIVERY_STEPS : PICKUP_STEPS;
  const meta = ORDER_STATUS[status];
  let current = meta.step ?? 0;
  if (fulfilment === "pickup" && current > 2) current = 3;

  const failed = status === "REJECTED" || status === "FAILED" || status === "REFUND_PENDING" || status === "REFUNDED";

  const timeFor = (i: number) => {
    if (!events) return undefined;
    const match = events.find((e) => ORDER_STATUS[e.status].step === i);
    return match?.at;
  };

  if (orientation === "vertical") {
    return (
      <ol className="relative flex flex-col" aria-label="Order progress">
        {steps.map((label, i) => {
          const done = !failed && i < current;
          const active = !failed && i === current;
          return (
            <li key={label} className="flex gap-3 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <StepDot done={done} active={active} failed={failed && i === current} />
                {i < steps.length - 1 && (
                  <span className={cn("w-0.5 flex-1", done ? "bg-deep" : "bg-line")} />
                )}
              </div>
              <div className="-mt-0.5 pb-1">
                <p className={cn("text-[14px]", done || active ? "font-semibold text-ink" : "text-grey")}>
                  {label}
                </p>
                {timeFor(i) && <p className="num text-[12px] text-grey">{timeFor(i)}</p>}
                {active && <p className="mt-0.5 text-[12px] font-medium text-deep">{meta.customer}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="flex items-start" aria-label="Order progress">
      {steps.map((label, i) => {
        const done = !failed && i < current;
        const active = !failed && i === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center last:flex-none last:w-auto">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done || active ? "bg-deep" : "bg-line")} />
              <StepDot done={done} active={active} failed={failed && i === current} />
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === steps.length - 1 ? "bg-transparent" : done ? "bg-deep" : "bg-line",
                )}
              />
            </div>
            <p
              className={cn(
                "mt-2 px-1 text-center text-[12px] leading-tight",
                done || active ? "font-semibold text-ink" : "text-grey",
              )}
            >
              {label}
            </p>
            {timeFor(i) && <p className="num text-[11px] text-grey">{timeFor(i)}</p>}
          </li>
        );
      })}
    </ol>
  );
}

function StepDot({ done, active, failed }: { done: boolean; active: boolean; failed: boolean }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
        failed
          ? "border-cta bg-cta text-white"
          : done
            ? "border-deep bg-deep text-white"
            : active
              ? "border-deep bg-white text-deep"
              : "border-line bg-white text-grey",
      )}
    >
      {failed ? (
        <Icon name="cross" size={14} />
      ) : done ? (
        <Icon name="check" size={14} />
      ) : active ? (
        <span className="pulse-dot size-2.5 rounded-full bg-deep" />
      ) : (
        <span className="size-2 rounded-full bg-line" />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Full event timeline (admin + tracking detail)                       */
/* ------------------------------------------------------------------ */

export function EventTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="flex flex-col">
      {events.map((e, i) => {
        const meta = ORDER_STATUS[e.status];
        return (
          <li key={`${e.status}-${i}`} className="flex gap-3 pb-3.5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full",
                  meta.tone === "danger" ? "bg-cta text-white" : "bg-mint text-deep",
                )}
              >
                <Icon name={meta.icon} size={12} />
              </span>
              {i < events.length - 1 && <span className="w-0.5 flex-1 bg-line" />}
            </div>
            <div className="-mt-0.5 min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">{e.label}</p>
              <p className="num text-[12px] text-grey">
                {e.at} · {e.actor}
              </p>
              {e.note && <p className="mt-0.5 text-[12px] text-grey">{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Simple bar chart (admin reports) — labelled axes, no chart library  */
/* ------------------------------------------------------------------ */

export function BarChart({
  data,
  xLabel,
  yLabel,
  series,
  caption,
}: {
  data: { label: string; values: number[] }[];
  xLabel: string;
  yLabel: string;
  series: { name: string; color: string }[];
  caption: string;
}) {
  const max = Math.max(1, ...data.flatMap((d) => d.values.reduce((a, b) => a + b, 0) === 0 ? [0] : d.values));
  return (
    <figure className="flex flex-col gap-2">
      <div className="flex items-end gap-1.5" style={{ height: 150 }}>
        <span className="mr-1 shrink-0 -rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-grey">
          {yLabel}
        </span>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 120 }}>
              {d.values.map((v, i) => (
                <div
                  key={i}
                  title={`${series[i]?.name}: ${v}`}
                  style={{ height: `${(v / max) * 100}%`, background: series[i]?.color }}
                  className="w-full max-w-3 rounded-t-[3px]"
                />
              ))}
            </div>
            <span className="num text-[10px] text-grey">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-grey">{xLabel}</span>
        <div className="flex gap-3">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-grey">
              <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="text-[11px] text-grey">{caption}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Order line summary shared by cart, checkout, receipt, admin         */
/* ------------------------------------------------------------------ */

export function TotalsBlock({
  subtotal,
  discount,
  deliveryFee,
  tax,
  total,
  promotionLabel,
  fulfilment,
  compact,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  promotionLabel?: string;
  fulfilment: FulfilmentType;
  compact?: boolean;
}) {
  const Row = ({ k, v, strong, negative }: { k: ReactNode; v: string; strong?: boolean; negative?: boolean }) => (
    <div className={cn("flex items-baseline justify-between gap-4", compact ? "py-1" : "py-1.5")}>
      <span className={cn(strong ? "text-[16px] font-semibold text-ink" : "text-[14px] text-grey")}>{k}</span>
      <span
        className={cn(
          "num",
          strong ? "text-[20px] font-bold text-ink" : "text-[14px] font-medium text-ink",
          negative && "text-deep",
        )}
      >
        {v}
      </span>
    </div>
  );
  return (
    <div>
      <Row k="Subtotal" v={money(subtotal)} />
      {discount > 0 && (
        <Row k={promotionLabel ? `Promotion · ${promotionLabel}` : "Promotion"} v={`−${money(discount)}`} negative />
      )}
      <Row
        k={fulfilment === "delivery" ? "Delivery fee" : "Pickup"}
        v={fulfilment === "delivery" ? money(deliveryFee) : "Free"}
      />
      <Row k="SST 6%" v={money(tax)} />
      <div className="my-2 border-t border-line" />
      <Row k="Total" v={money(total)} strong />
    </div>
  );
}

export function OrderLinesList({ order, compact }: { order: Order; compact?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {order.lines.map((l) => (
        <li key={l.lineId} className="flex gap-3">
          <span className="num mt-0.5 shrink-0 rounded-[6px] bg-mint px-1.5 py-0.5 text-[12px] font-bold text-deep">
            {l.quantity}×
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium text-ink", compact ? "text-[13px]" : "text-[14px]")}>{l.name}</p>
            {l.options.length > 0 && (
              <p className="text-[12px] leading-snug text-grey">
                {l.options.map((o) => o.choiceName).join(" · ")}
              </p>
            )}
            {l.notes && <p className="text-[12px] italic leading-snug text-grey">“{l.notes}”</p>}
          </div>
          <span className="num shrink-0 text-[14px] font-medium text-ink">
            {money(l.unitPrice * l.quantity)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function IconStat({ icon, label, value }: { icon: IconKey; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-grey">{label}</p>
        <p className="truncate text-[14px] font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
