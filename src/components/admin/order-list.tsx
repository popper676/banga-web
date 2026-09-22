"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import {
  FulfilmentTag,
  LiveAnnouncer,
  OPS_CLOCK_LABEL,
  PrototypeNote,
  itemSummary,
  maskPhone,
  minutesSince,
  relativeAge,
  timeOf,
  dateOf,
  useOpsClock,
} from "@/components/admin/ops-shared";
import { OrderActionBar } from "@/components/admin/order-actions";
import { BRANCHES, branchById } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";
import { Icon } from "@/components/ui/icons";
import { Chip, Segmented, SelectField, TextField } from "@/components/ui/forms";
import { Drawer } from "@/components/ui/overlays";
import { DataTable, OrderLinesList, Pagination, TotalsBlock, type Column } from "@/components/ui/data";
import {
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  ErrorState,
  PaymentBadge,
  SkeletonRow,
  StatusBadge,
} from "@/components/ui/primitives";

const PAGE_SIZE = 8;

const STATUS_ORDER = Object.keys(ORDER_STATUS) as OrderStatus[];

type SavedView = "waiting" | "late" | "refund" | null;

export function OrderList() {
  const { orders, hydrated, pushToast } = useStore();
  const now = useOpsClock(5000);

  const [branch, setBranch] = useState("all");
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [fulfilment, setFulfilment] = useState<"all" | "pickup" | "delivery">("all");
  const [payment, setPayment] = useState<"all" | PaymentStatus>("all");
  const [from, setFrom] = useState("2026-09-18");
  const [to, setTo] = useState("2026-09-21");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<SavedView>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const loading = !hydrated || now === null;
  const clock = now ?? Date.parse("2026-09-21T19:08:00+08:00");

  const isLate = (o: Order) => {
    const target = branchById(o.branchId).prepTimeMinutes + (o.fulfilment === "delivery" ? 20 : 6);
    const open = !["COMPLETED", "REFUNDED", "CANCELLED", "REJECTED"].includes(o.status);
    return open && minutesSince(o.placedAt, clock) > target;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return orders.filter((o) => {
      if (branch !== "all" && o.branchId !== branch) return false;
      if (statuses.length > 0 && !statuses.includes(o.status)) return false;
      if (fulfilment !== "all" && o.fulfilment !== fulfilment) return false;
      if (payment !== "all" && o.payment.status !== payment) return false;
      const day = o.placedAt.slice(0, 10);
      if (day < from || day > to) return false;
      if (view === "waiting" && o.status !== "WAITING_FOR_BRANCH") return false;
      if (view === "refund" && o.status !== "REFUND_PENDING") return false;
      if (view === "late" && !isLate(o)) return false;
      if (q) {
        const hay = `${o.code} ${o.customerName}`.toLowerCase();
        const phone = o.customerPhone.replace(/\D/g, "");
        if (!hay.includes(q) && !(qDigits.length >= 3 && phone.includes(qDigits))) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, branch, statuses, fulfilment, payment, from, to, search, view, clock]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totals = {
    orders: filtered.length,
    units: filtered.reduce((n, o) => n + o.lines.reduce((u, l) => u + l.quantity, 0), 0),
    revenue: filtered.filter((o) => o.payment.status !== "unpaid").reduce((s, o) => s + o.total, 0),
    refunds: filtered
      .filter((o) => ["refund_pending", "refunded", "manual_refund_required"].includes(o.payment.status))
      .reduce((s, o) => s + o.total, 0),
  };

  const drawerOrder = orders.find((o) => o.id === drawerId) ?? null;
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  function toggleRow(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function resetFilters() {
    setBranch("all");
    setStatuses([]);
    setFulfilment("all");
    setPayment("all");
    setSearch("");
    setView(null);
    setFrom("2026-09-18");
    setTo("2026-09-21");
    setPage(1);
  }

  function exportCsv() {
    const count = selected.length > 0 ? selected.length : filtered.length;
    pushToast({
      tone: "success",
      title: "CSV export ready",
      body: `bangga-orders-${to}.csv · ${count} ${count === 1 ? "row" : "rows"} · order code, placed, customer, branch, fulfilment, items, total, payment, status`,
      actionLabel: "Download",
      onAction: () =>
        pushToast({
          tone: "neutral",
          title: "Prototype export",
          body: "No file is generated in this prototype — the export is illustrative only.",
        }),
    });
  }

  const columns: Column<Order>[] = [
    {
      key: "select",
      header: "Select",
      width: "56px",
      render: (o) => (
        <label
          className="flex min-h-11 items-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Select order {o.code}</span>
          <input
            type="checkbox"
            checked={selected.includes(o.id)}
            onChange={() => toggleRow(o.id)}
            className="size-4.5 accent-[var(--color-cta)]"
          />
        </label>
      ),
    },
    {
      key: "code",
      header: "Order",
      width: "150px",
      render: (o) => (
        <div>
          <p className="num text-[13.5px] font-bold text-ink">{o.code}</p>
          <p className="flex items-center gap-1 text-[11.5px] text-grey">
            <Icon name={o.payment.method === "visa" ? "card" : "qr"} size={12} />
            {o.payment.method === "visa" ? "Visa" : "DuitNow QR"}
            {o.isGuest && " · Guest"}
          </p>
        </div>
      ),
    },
    {
      key: "placed",
      header: "Placed",
      width: "120px",
      render: (o) => (
        <div>
          <p className="num text-[13.5px] text-ink">
            {timeOf(o.placedAt)} <span className="text-grey">{dateOf(o.placedAt)}</span>
          </p>
          <p className="text-[11.5px] text-grey">{relativeAge(o.placedAt, clock)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-ink">{o.customerName}</p>
          <p className="num text-[11.5px] text-grey">{maskPhone(o.customerPhone)}</p>
        </div>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      width: "120px",
      render: (o) => <span className="text-[13px] text-ink">{branchById(o.branchId).shortName}</span>,
    },
    {
      key: "fulfilment",
      header: "Fulfilment",
      width: "116px",
      render: (o) => <FulfilmentTag type={o.fulfilment} />,
    },
    {
      key: "items",
      header: "Items",
      width: "128px",
      hideAtLaptop: true,
      render: (o) => <span className="num text-[12.5px] text-grey">{itemSummary(o)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      width: "96px",
      render: (o) => <span className="num text-[13.5px] font-semibold text-ink">{money(o.total)}</span>,
    },
    {
      key: "payment",
      header: "Payment",
      width: "150px",
      render: (o) => <PaymentBadge status={o.payment.status} soft />,
    },
    {
      key: "status",
      header: "Order status",
      width: "170px",
      render: (o) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={o.status} audience="admin" soft />
          {isLate(o) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-cta">
              <Icon name="alert" size={11} />
              Late
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "112px",
      render: (o) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/orders/${o.id}`}
            className="inline-flex min-h-9 items-center rounded-full border border-line px-2.5 text-[12.5px] font-semibold text-ink hover:bg-mint"
          >
            Open
          </Link>
          <button
            onClick={() =>
              pushToast({
                tone: "neutral",
                title: "Kitchen ticket sent",
                body: `${o.code} → ${branchById(o.branchId).shortName} printer. Prototype only.`,
              })
            }
            aria-label={`Print kitchen ticket for ${o.code}`}
            className="flex size-9 items-center justify-center rounded-full border border-line text-ink hover:bg-mint"
          >
            <Icon name="printer" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="Orders"
      description={`Every order from both branches · prototype clock ${OPS_CLOCK_LABEL}`}
      actions={
        <>
          <Button size="sm" variant="secondary" iconStart="download" onClick={exportCsv}>
            Export CSV
          </Button>
          <ButtonLink size="sm" variant="secondary" href="/admin/confirmation" iconStart="hourglass">
            Confirmation queue
          </ButtonLink>
        </>
      }
    >
      <LiveAnnouncer
        message={loading ? "" : `${filtered.length} orders match the current filters.`}
      />

      {/* ---------------- Saved views ---------------- */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-grey">Saved views</span>
        <Chip
          active={view === "waiting"}
          icon="hourglass"
          count={orders.filter((o) => o.status === "WAITING_FOR_BRANCH").length}
          onClick={() => {
            setView(view === "waiting" ? null : "waiting");
            setPage(1);
          }}
        >
          Waiting on branch
        </Chip>
        <Chip
          active={view === "late"}
          icon="alert"
          count={orders.filter(isLate).length}
          onClick={() => {
            setView(view === "late" ? null : "late");
            setPage(1);
          }}
        >
          Late
        </Chip>
        <Chip
          active={view === "refund"}
          icon="refund"
          count={orders.filter((o) => o.status === "REFUND_PENDING").length}
          onClick={() => {
            setView(view === "refund" ? null : "refund");
            setPage(1);
          }}
        >
          Refund pending
        </Chip>
        <button
          onClick={resetFilters}
          className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-deep hover:bg-mint"
        >
          <Icon name="cross" size={14} />
          Clear all filters
        </button>
      </div>

      {/* ---------------- Filter bar ---------------- */}
      <AdminCard className="mb-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Branch"
            value={branch}
            onChange={(e) => {
              setBranch((e.target as HTMLSelectElement).value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All branches" },
              ...BRANCHES.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
          <SelectField
            label="Payment status"
            value={payment}
            onChange={(e) => {
              setPayment((e.target as HTMLSelectElement).value as "all" | PaymentStatus);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Any payment status" },
              ...(Object.keys(PAYMENT_STATUS) as PaymentStatus[]).map((s) => ({
                value: s,
                label: PAYMENT_STATUS[s].label,
              })),
            ]}
          />
          <TextField
            label="Search"
            type="search"
            iconStart="search"
            placeholder="Order code, name or phone"
            hint="Try BG-260921, Kumar or 4410"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink">Fulfilment</span>
            <Segmented
              label="Fulfilment type"
              value={fulfilment}
              onChange={(v) => {
                setFulfilment(v);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All" },
                { value: "delivery", label: "Delivery", icon: "bike" },
                { value: "pickup", label: "Pickup", icon: "bag" },
              ]}
            />
          </div>
          <TextField
            label="Placed from"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <TextField
            label="Placed to"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <fieldset className="mt-4 border-0 p-0">
          <legend className="mb-2 text-[13px] font-semibold text-ink">
            Order status
            <span className="ml-1.5 font-normal text-grey">
              ({statuses.length === 0 ? "all statuses" : `${statuses.length} selected`})
            </span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              return (
                <Chip
                  key={s}
                  active={statuses.includes(s)}
                  icon={ORDER_STATUS[s].icon}
                  count={count}
                  onClick={() => {
                    setStatuses((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                    );
                    setPage(1);
                  }}
                >
                  {ORDER_STATUS[s].admin}
                </Chip>
              );
            })}
          </div>
        </fieldset>
      </AdminCard>

      {/* ---------------- Bulk bar ---------------- */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[12px] border border-line bg-white px-3 py-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[13px] font-semibold text-ink">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            onChange={() =>
              setSelected(allOnPageSelected ? [] : Array.from(new Set([...selected, ...rows.map((r) => r.id)])))
            }
            className="size-4.5 accent-[var(--color-cta)]"
          />
          Select all on this page
        </label>
        <span className="num text-[13px] text-grey" aria-live="polite">
          {selected.length} selected
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            iconStart="printer"
            disabled={selected.length === 0}
            onClick={() =>
              pushToast({
                tone: "neutral",
                title: `${selected.length} kitchen tickets queued`,
                body: "Sent to the branch printers in order code sequence. Prototype only — nothing is printed.",
              })
            }
          >
            Bulk print
          </Button>
          <Button
            size="sm"
            variant="secondary"
            iconStart="download"
            disabled={selected.length === 0}
            onClick={exportCsv}
          >
            Export selected
          </Button>
          <Button size="sm" variant="ghost" disabled={selected.length === 0} onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      {failed ? (
        <ErrorState
          title="The order list could not be loaded"
          body="The request timed out. Nothing has changed — retry to load the list again."
          requestId="REF-ORD-51188"
          onRetry={() => setFailed(false)}
        />
      ) : loading ? (
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          <table className="w-full min-w-[720px]">
            <caption className="sr-only">Loading orders</caption>
            <thead>
              <tr className="border-b border-line bg-cream/60">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-grey"
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No orders match these filters"
          body="Nothing was found for this branch, status and date range. Widen the date range or clear the filters to see today's orders again."
          action={
            <Button size="sm" variant="secondary" iconStart="refund" onClick={resetFilters}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            caption={`Orders matching the current filters, ${filtered.length} in total. Select a row to open the order detail panel.`}
            columns={columns}
            rows={rows}
            selectedId={drawerId}
            onRowClick={(o) => setDrawerId(o.id)}
          />

          {/* Sticky column totals */}
          <dl className="sticky bottom-0 z-10 mt-0 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-b-[14px] border border-t-0 border-line bg-cream/95 px-4 py-2.5">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Orders</dt>
              <dd className="num text-[14px] font-bold text-ink">{totals.orders}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Units</dt>
              <dd className="num text-[14px] font-bold text-ink">{totals.units}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Collected</dt>
              <dd className="num text-[14px] font-bold text-ink">{money(totals.revenue)}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">
                In refund
              </dt>
              <dd className="num text-[14px] font-bold text-cta">{money(totals.refunds)}</dd>
            </div>
            <p className="ml-auto text-[11.5px] text-grey">
              Totals cover all {totals.orders} filtered orders, not just this page.
            </p>
          </dl>

          <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <PrototypeNote>
          Row click opens the quick panel. Open the full order page for the timeline, payment record
          and refund controls.
        </PrototypeNote>
        <Button size="sm" variant="ghost" iconStart="alert" onClick={() => setFailed(true)}>
          Show the list error state
        </Button>
      </div>

      {/* ---------------- Detail drawer ---------------- */}
      <Drawer
        open={drawerOrder !== null}
        onClose={() => setDrawerId(null)}
        title={drawerOrder ? drawerOrder.code : ""}
        subtitle={
          drawerOrder
            ? `${drawerOrder.customerName} · ${branchById(drawerOrder.branchId).shortName} · ${timeOf(
                drawerOrder.placedAt,
              )}`
            : undefined
        }
        footer={
          drawerOrder ? (
            <>
              <ButtonLink href={`/admin/orders/${drawerOrder.id}`} size="sm" iconEnd="arrowRight">
                Open full order
              </ButtonLink>
              <Button
                size="sm"
                variant="secondary"
                iconStart="printer"
                onClick={() =>
                  pushToast({
                    tone: "neutral",
                    title: "Kitchen ticket sent",
                    body: `${drawerOrder.code} → ${branchById(drawerOrder.branchId).shortName} printer. Prototype only.`,
                  })
                }
              >
                Print ticket
              </Button>
            </>
          ) : undefined
        }
      >
        {drawerOrder && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={drawerOrder.status} audience="admin" />
              <PaymentBadge status={drawerOrder.payment.status} soft />
              <FulfilmentTag type={drawerOrder.fulfilment} />
              {drawerOrder.isGuest && (
                <Badge tone="neutral" icon="user" soft>
                  Guest checkout
                </Badge>
              )}
            </div>

            <section aria-labelledby="drawer-next">
              <h3 id="drawer-next" className="mb-2 text-[14px]">
                Next action
              </h3>
              <OrderActionBar order={drawerOrder} />
            </section>

            <section aria-labelledby="drawer-items">
              <h3 id="drawer-items" className="mb-2 text-[14px]">
                Items
              </h3>
              <OrderLinesList order={drawerOrder} compact />
            </section>

            <section aria-labelledby="drawer-totals">
              <h3 id="drawer-totals" className="mb-1 text-[14px]">
                Totals
              </h3>
              <TotalsBlock
                subtotal={drawerOrder.subtotal}
                discount={drawerOrder.discount}
                deliveryFee={drawerOrder.deliveryFee}
                tax={drawerOrder.tax}
                total={drawerOrder.total}
                promotionLabel={drawerOrder.promotionCode}
                fulfilment={drawerOrder.fulfilment}
                compact
              />
            </section>

            <section aria-labelledby="drawer-contact">
              <h3 id="drawer-contact" className="mb-2 text-[14px]">
                Contact
              </h3>
              <p className="num text-[13.5px] text-ink">{maskPhone(drawerOrder.customerPhone)}</p>
              <p className="mt-1 text-[12.5px] text-grey">
                Full number is revealed on the order page and the reveal is written to the audit log.
              </p>
            </section>

            {drawerOrder.fulfilment === "delivery" && drawerOrder.address && (
              <section aria-labelledby="drawer-address">
                <h3 id="drawer-address" className="mb-2 text-[14px]">
                  Delivery address
                </h3>
                <p className={cn("text-[13.5px] leading-relaxed text-ink")}>
                  {drawerOrder.address.line1}
                  {drawerOrder.address.line2 ? `, ${drawerOrder.address.line2}` : ""}
                  <br />
                  {drawerOrder.address.postcode} {drawerOrder.address.city},{" "}
                  {drawerOrder.address.state}
                </p>
              </section>
            )}
          </div>
        )}
      </Drawer>
    </AdminShell>
  );
}