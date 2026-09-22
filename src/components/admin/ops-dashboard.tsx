"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminCard, AdminShell, AlertRow } from "@/components/admin/shell";
import {
  AutoRefreshIndicator,
  ElapsedBadge,
  FulfilmentTag,
  LiveAnnouncer,
  OPS_CLOCK_LABEL,
  PrototypeNote,
  StatCard,
  minutesSince,
  relativeAge,
  slaWindowSeconds,
  useOpsClock,
} from "@/components/admin/ops-shared";
import { BRANCHES, DASHBOARD, PRODUCTS, PROTOTYPE_RULES, branchById } from "@/lib/mock-data";
import { branchStatus, cn, countdown, money, todayHours } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";
import { Icon } from "@/components/ui/icons";
import { BarChart } from "@/components/ui/data";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusBadge,
} from "@/components/ui/primitives";

/**
 * Comparison figures for the "versus yesterday" indicators. The prototype has
 * no historical series, so these are fixed percentages for the same shift
 * yesterday rather than anything computed.
 */
const VS_YESTERDAY = {
  orders: 9,
  revenue: 12,
  avgOrder: -3,
  awaiting: 0,
  late: 25,
  refunds: -40,
} as const;

/** Simulated median rider wait per branch, in minutes. */
const RIDER_WAIT = { ss15: 4, taylors: 7 } as const;
/** Simulated median prep time this shift, in minutes. */
const ACTUAL_PREP = { ss15: 21, taylors: 16 } as const;

const ACTIVE_STATUSES: Order["status"][] = [
  "WAITING_FOR_BRANCH",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "LALAMOVE_BOOKED",
  "RIDER_PICKED_UP",
  "OUT_FOR_DELIVERY",
];

export function OpsDashboard() {
  const { orders, hydrated, sim, pushToast } = useStore();
  const now = useOpsClock();
  const [dataError, setDataError] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(0);

  /** Simulated 10-second polling cycle for the live indicators. */
  useEffect(() => {
    const id = window.setInterval(() => setRefreshedAt((s) => (s >= 10 ? 0 : s + 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const loading = !hydrated || now === null;
  const clock = now ?? Date.parse("2026-09-21T19:08:00+08:00");

  const waiting = orders.filter((o) => o.status === "WAITING_FOR_BRANCH");
  const refundsPending = orders.filter((o) => o.status === "REFUND_PENDING");
  const failedDeliveries = orders.filter((o) => o.status === "FAILED");
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const lateOrders = active.filter((o) => {
    const target = branchById(o.branchId).prepTimeMinutes + (o.fulfilment === "delivery" ? 20 : 6);
    return minutesSince(o.placedAt, clock) > target;
  });

  const slaSeconds = slaWindowSeconds(sim.fastForward);

  const lowStock = BRANCHES.flatMap((b) =>
    PRODUCTS.filter((p) => p.availability[b.id] !== "available").map((p) => ({
      branch: b.shortName,
      product: p.name,
      state: p.availability[b.id],
    })),
  );

  const feed = [...orders]
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
    .slice(0, 7);

  if (dataError) {
    return (
      <AdminShell title="Dashboard" description="Today across both branches">
        <ErrorState
          title="Today's figures could not be loaded"
          body="The operations summary did not respond. Live order data is still available on the Orders screen."
          requestId="REF-DASH-77120"
          onRetry={() => setDataError(false)}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      description={`Monday 21 September · dinner service · prototype clock ${OPS_CLOCK_LABEL}`}
      actions={
        <>
          <AutoRefreshIndicator seconds={refreshedAt} live />
          <Button
            size="sm"
            variant="secondary"
            iconStart="refund"
            onClick={() => {
              setRefreshedAt(0);
              pushToast({ tone: "neutral", title: "Figures refreshed", body: "Prototype data — nothing was fetched." });
            }}
          >
            Refresh
          </Button>
          <ButtonLink size="sm" href="/admin/confirmation" iconStart="hourglass">
            Confirmation queue
            {waiting.length > 0 ? ` (${waiting.length})` : ""}
          </ButtonLink>
        </>
      }
    >
      <LiveAnnouncer
        message={
          loading
            ? ""
            : `${waiting.length} orders waiting for branch confirmation, ${lateOrders.length} running late.`
        }
      />

      {sim.offline && (
        <Callout tone="warning" icon="wifiOff" title="Offline — figures may be stale" className="mb-5">
          The console is showing the last values it received. Confirmations and delivery bookings are
          disabled until the connection returns.
        </Callout>
      )}

      {/* ---------------- KPI row ---------------- */}
      <section aria-labelledby="kpi-heading" className="mb-6">
        <h2 id="kpi-heading" className="sr-only">
          Key figures for today
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Orders today"
            value={DASHBOARD.ordersToday}
            delta={VS_YESTERDAY.orders}
            icon="receipt"
            loading={loading}
          />
          <StatCard
            label="Revenue today"
            value={money(DASHBOARD.revenueToday)}
            delta={VS_YESTERDAY.revenue}
            icon="chart"
            loading={loading}
          />
          <StatCard
            label="Average order"
            value={money(DASHBOARD.avgOrder)}
            delta={VS_YESTERDAY.avgOrder}
            icon="card"
            loading={loading}
          />
          <StatCard
            label="Awaiting confirmation"
            value={waiting.length}
            delta={VS_YESTERDAY.awaiting}
            deltaGoodWhen="down"
            sub={`Each has ${countdown(slaSeconds)} to be accepted`}
            icon="hourglass"
            tone={waiting.length > 0 ? "warning" : "neutral"}
            loading={loading}
          />
          <StatCard
            label="Late orders"
            value={lateOrders.length}
            delta={VS_YESTERDAY.late}
            deltaGoodWhen="down"
            sub="Past the quoted prep or delivery window"
            icon="alert"
            tone={lateOrders.length > 0 ? "danger" : "neutral"}
            loading={loading}
          />
          <StatCard
            label="Refunds pending"
            value={refundsPending.length}
            delta={VS_YESTERDAY.refunds}
            deltaGoodWhen="down"
            sub={money(refundsPending.reduce((s, o) => s + o.total, 0))}
            icon="refund"
            tone={refundsPending.length > 0 ? "warning" : "neutral"}
            loading={loading}
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* ---------------- Needs attention ---------------- */}
        <AdminCard
          title="Needs attention"
          className="xl:col-span-2"
          action={
            <Link
              href="/admin/orders"
              className="inline-flex min-h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-deep hover:bg-mint"
            >
              All orders
              <Icon name="chevronRight" size={14} />
            </Link>
          }
        >
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : waiting.length + failedDeliveries.length + refundsPending.length + lowStock.length ===
            0 ? (
            <EmptyState
              icon="check"
              compact
              title="Nothing needs attention"
              body="Every order is inside its window, no delivery has failed and stock is complete at both branches."
            />
          ) : (
            <ul>
              {waiting.map((o) => (
                <AlertRow
                  key={o.id}
                  tone="danger"
                  title={`${o.code} is waiting for ${branchById(o.branchId).shortName} to accept`}
                  detail={`${o.customerName} · ${money(o.total)} · auto-rejects in ${countdown(
                    slaSeconds,
                  )} and refunds automatically`}
                  href="/admin/confirmation"
                  actionLabel="Confirm"
                />
              ))}
              {failedDeliveries.map((o) => (
                <AlertRow
                  key={o.id}
                  tone="danger"
                  title={`Delivery failed on ${o.code}`}
                  detail={
                    o.delivery?.failureReason ??
                    "Lalamove could not complete this booking. Re-book, refund or call the customer."
                  }
                  href="/admin/delivery"
                  actionLabel="Open delivery"
                />
              ))}
              {refundsPending
                .filter((o) => o.payment.status === "manual_refund_required")
                .map((o) => (
                  <AlertRow
                    key={`mismatch-${o.id}`}
                    tone="warning"
                    title={`Payment mismatch on ${o.code}`}
                    detail={`${o.payment.provider} captured ${money(o.payment.amount)} but the order was rejected. ${
                      o.payment.manualRefundReason ?? ""
                    }`}
                    href={`/admin/orders/${o.id}`}
                    actionLabel="Review"
                  />
                ))}
              {lowStock.slice(0, 3).map((s) => (
                <AlertRow
                  key={`${s.branch}-${s.product}`}
                  tone={s.state === "sold_out" ? "warning" : "info"}
                  title={`${s.product} is ${s.state === "sold_out" ? "sold out" : "low"} at ${s.branch}`}
                  detail={
                    s.state === "sold_out"
                      ? "Hidden from the menu at that branch until someone marks it available again."
                      : "Fewer than 10 portions left for this shift."
                  }
                  href="/admin/inventory"
                  actionLabel="Inventory"
                />
              ))}
            </ul>
          )}
          <PrototypeNote>{PROTOTYPE_RULES.branchSlaLabel}</PrototypeNote>
        </AdminCard>

        {/* ---------------- Branch comparison ---------------- */}
        <AdminCard title="Branch comparison">
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <div className="flex flex-col gap-4">
              {BRANCHES.map((b) => {
                const status = branchStatus(b, new Date(clock));
                const branchActive = active.filter((o) => o.branchId === b.id);
                const wait = RIDER_WAIT[b.id as keyof typeof RIDER_WAIT] ?? 5;
                return (
                  <div key={b.id} className="rounded-[12px] border border-line p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink">{b.shortName}</p>
                      <Badge tone={status.open ? "success" : "neutral"} icon={status.open ? "check" : "clock"} soft>
                        {status.open ? "Open" : "Closed"} · {todayHours(b, new Date(clock))}
                      </Badge>
                    </div>
                    <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-[10px] bg-cream/70 py-2">
                        <dt className="text-[11px] text-grey">Active</dt>
                        <dd className="num text-[18px] font-bold text-ink">{branchActive.length}</dd>
                      </div>
                      <div className="rounded-[10px] bg-cream/70 py-2">
                        <dt className="text-[11px] text-grey">Prep</dt>
                        <dd className="num text-[18px] font-bold text-ink">
                          {ACTUAL_PREP[b.id as keyof typeof ACTUAL_PREP] ?? b.prepTimeMinutes}
                          <span className="text-[11px] font-medium text-grey"> min</span>
                        </dd>
                      </div>
                      <div className="rounded-[10px] bg-cream/70 py-2">
                        <dt className="text-[11px] text-grey">Rider wait</dt>
                        <dd className="num text-[18px] font-bold text-ink">
                          {wait}
                          <span className="text-[11px] font-medium text-grey"> min</span>
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-grey">
                      <Icon name="clock" size={13} />
                      Quoted prep {b.prepTimeMinutes} min ·{" "}
                      {(ACTUAL_PREP[b.id as keyof typeof ACTUAL_PREP] ?? 0) > b.prepTimeMinutes
                        ? "running over"
                        : "on target"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>

        {/* ---------------- Orders by hour ---------------- */}
        <AdminCard title="Orders by hour" className="xl:col-span-2">
          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : (
            <BarChart
              xLabel="Hour of day"
              yLabel="Orders"
              caption="Paid orders per hour today, split by branch. Source: prototype mock data."
              series={[
                { name: "SS15", color: "#000000" },
                { name: "Taylor's Lakeside", color: "#6EC7CE" },
              ]}
              data={DASHBOARD.ordersByHour.map((h) => ({
                label: h.hour,
                values: [h.ss15, h.taylors],
              }))}
            />
          )}
        </AdminCard>

        {/* ---------------- Top sellers ---------------- */}
        <AdminCard title="Top-selling dishes today">
          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : (
            <ol className="flex flex-col gap-2.5">
              {DASHBOARD.topProducts.map((p, i) => {
                const max = DASHBOARD.topProducts[0].units;
                return (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13.5px] font-medium text-ink">
                        <span className="num mr-1.5 text-grey">{i + 1}.</span>
                        {p.name}
                      </p>
                      <p className="num shrink-0 text-[13px] font-semibold text-ink">
                        {p.units} <span className="font-normal text-grey">· {money(p.revenue)}</span>
                      </p>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
                      <div
                        className="h-full rounded-full bg-deep"
                        style={{ width: `${(p.units / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminCard>

        {/* ---------------- Live feed ---------------- */}
        <AdminCard
          title="Live order feed"
          className="xl:col-span-3"
          action={<AutoRefreshIndicator seconds={refreshedAt} live={!sim.offline} label="Streaming new orders" />}
        >
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <EmptyState compact icon="list" title="No orders yet today" body="New orders appear here the moment they are paid." />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {feed.map((o) => {
                const target =
                  branchById(o.branchId).prepTimeMinutes + (o.fulfilment === "delivery" ? 20 : 6);
                return (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex flex-wrap items-center gap-3 py-2.5 hover:bg-mint/40"
                    >
                      <span className="num w-[132px] shrink-0 text-[13.5px] font-bold text-ink">
                        {o.code}
                      </span>
                      <span className="min-w-[140px] flex-1 text-[13.5px] text-ink">
                        {o.customerName}
                        <span className="block text-[12px] text-grey">
                          {branchById(o.branchId).shortName} · {relativeAge(o.placedAt, clock)}
                        </span>
                      </span>
                      <FulfilmentTag type={o.fulfilment} />
                      <StatusBadge status={o.status} audience="admin" soft />
                      {ACTIVE_STATUSES.includes(o.status) && (
                        <ElapsedBadge minutes={minutesSince(o.placedAt, clock)} targetMinutes={target} size="sm" />
                      )}
                      <span className={cn("num w-[84px] shrink-0 text-right text-[13.5px] font-semibold text-ink")}>
                        {money(o.total)}
                      </span>
                      <span className="text-grey">
                        <Icon name="chevronRight" size={15} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="mt-5">
        <Button
          size="sm"
          variant="ghost"
          iconStart="alert"
          onClick={() => setDataError(true)}
        >
          Show the dashboard error state
        </Button>
      </div>
    </AdminShell>
  );
}
