"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import { StatCard } from "@/components/admin/ops-shared";
import { BRANCHES, CUSTOMERS, DASHBOARD, MOCK_ORDERS, PROTOTYPE_RULES } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, Button, Callout, EmptyState, ErrorState } from "@/components/ui/primitives";
import { BarChart, DataTable, Pagination, type Column } from "@/components/ui/data";
import {
  FilterDate,
  FilterSearch,
  FilterSelect,
  PROVIDER_COPY,
  REFUND_TIMING,
  ResultCount,
  StateSwitch,
  TableSkeleton,
  Toolbar,
  errorRef,
  usePaged,
  useScreenState,
  useSimulatedExport,
} from "@/components/admin/config-shared";
import {
  MISMATCHES,
  PROMO_META,
  REFUND_REQUESTS,
  REFUND_STATUS,
  TRANSACTIONS,
  TX_STATUS,
  dateLabel,
  timeLabel,
  type RefundRequest,
  type RefundStatus,
  type Transaction,
  type TxStatus,
} from "@/components/admin/money-data";
import { color } from "@/lib/tokens";

function TxStatusBadge({ status }: { status: TxStatus }) {
  const meta = TX_STATUS[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon} soft>
      {meta.label}
    </Badge>
  );
}

function ProviderLine({ tx }: { tx: Pick<Transaction, "method" | "provider"> }) {
  const copy = PROVIDER_COPY[tx.method];
  return (
    <span className="text-[13px] text-grey">
      {copy.method} · {copy.provider}
    </span>
  );
}

export function PaymentsScreen() {
  const router = useRouter();
  const exportFile = useSimulatedExport();
  const { state, setState } = useScreenState();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("2026-09-18");

  const rows = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      const q = query.trim().toLowerCase();
      const hit =
        !q ||
        t.orderCode.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q);
      const byMethod = method === "all" || t.method === method;
      const byStatus = status === "all" || t.status === status;
      const byDate = t.at.slice(0, 10) >= from;
      return hit && byMethod && byStatus && byDate;
    });
  }, [query, method, status, from]);

  const paged = usePaged(rows, 8);

  const columns: Column<Transaction>[] = [
    {
      key: "when",
      header: "When",
      render: (t) => (
        <span className="num">
          {dateLabel(t.at)}
          <span className="ml-1 text-grey">{timeLabel(t.at)}</span>
        </span>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (t) => <span className="num font-semibold">{t.orderCode}</span>,
    },
    { key: "customer", header: "Customer", render: (t) => t.customer },
    {
      key: "method",
      header: "Method",
      render: (t) => <ProviderLine tx={t} />,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (t) => <span className="num font-semibold">{money(t.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <TxStatusBadge status={t.status} />,
    },
  ];

  return (
    <AdminShell
      title="Payments"
      description="Every card and DuitNow QR attempt, with the provider that processed it. Match a row against a bank statement before talking to a customer."
      actions={
        <>
          <StateSwitch state={state} onChange={setState} />
          <Button size="sm" variant="secondary" onClick={() => exportFile("CSV", "Payments for 18–21 Sep")}>
            Export CSV
          </Button>
        </>
      }
    >
      {MISMATCHES.length > 0 && state === "ready" && (
        <Callout tone="warning" title={`${MISMATCHES.length} settlement mismatches`} className="mb-4">
          {MISMATCHES[0].detail} Open the payment to compare our figure with the provider file.
        </Callout>
      )}

      <Toolbar label="Filter payments">
        <FilterSearch label="Search" value={query} onChange={setQuery} placeholder="Order, customer or reference" />
        <FilterSelect
          label="Method"
          value={method}
          onChange={setMethod}
          options={[
            { value: "all", label: "All methods" },
            { value: "visa", label: "Visa · Maybank" },
            { value: "duitnow_qr", label: "DuitNow QR · OXPay" },
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[{ value: "all", label: "All statuses" }, ...Object.entries(TX_STATUS).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
        <FilterDate label="From" value={from} onChange={setFrom} />
      </Toolbar>

      <div className="mt-3 flex items-center justify-between">
        <ResultCount>
          {rows.length} transaction{rows.length === 1 ? "" : "s"}
        </ResultCount>
      </div>

      {state === "loading" && <TableSkeleton cols={6} caption="Payments" />}
      {state === "empty" && (
        <div className="mt-4">
          <EmptyState icon="card" title="No payments in this range" body="Widen the dates or clear the search." compact />
        </div>
      )}
      {state === "error" && (
        <div className="mt-4">
          <ErrorState title="Payments could not load" body={`Quote ${errorRef("PAY")} to support. Nothing was charged.`} />
        </div>
      )}
      {state === "ready" && (
        <>
          <div className="mt-3">
            <DataTable
              caption="Payment transactions"
              columns={columns}
              rows={paged.slice}
              onRowClick={(t) => router.push(`/admin/payments/${t.id}`)}
            />
          </div>
          <Pagination page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
        </>
      )}
    </AdminShell>
  );
}

export function PaymentDetail({ paymentId }: { paymentId: string }) {
  const { pushToast } = useStore();
  const tx = TRANSACTIONS.find((t) => t.id === paymentId);
  const copy = tx ? PROVIDER_COPY[tx.method] : null;
  const refunds = REFUND_REQUESTS.filter((r) => r.paymentId === paymentId);

  if (!tx || !copy) {
    return (
      <AdminShell title="Payment" description="This reference is not in the prototype set.">
        <EmptyState icon="card" title="Payment not found" body="Return to the payments list." action={<ButtonLinkSafe />} />
      </AdminShell>
    );
  }

  const meta = TX_STATUS[tx.status];

  return (
    <AdminShell
      title={tx.internalId}
      description={`${tx.orderCode} · ${tx.customer} · ${copy.providerLine}`}
      actions={
        <>
          <TxStatusBadge status={tx.status} />
          {tx.orderId && (
            <Link
              href={`/admin/orders/${tx.orderId}`}
              className="inline-flex h-9 items-center rounded-full border border-line px-3 text-[13px] font-semibold hover:bg-mint"
            >
              Open order
            </Link>
          )}
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="Transaction">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Amount">{money(tx.amount)}</Detail>
            <Detail label="Method">{copy.method}</Detail>
            <Detail label="Provider">{copy.provider}</Detail>
            <Detail label="Reference">
              <span className="num">{tx.reference}</span>
            </Detail>
            {tx.maskedCard && (
              <Detail label="Card">
                Visa {tx.maskedCard}
              </Detail>
            )}
            {tx.duitnowReference && (
              <Detail label="DuitNow reference">
                <span className="num">{tx.duitnowReference}</span>
              </Detail>
            )}
            {tx.bankResponseCode && (
              <Detail label="Bank response">
                {tx.bankResponseCode} · {tx.bankResponseText}
              </Detail>
            )}
            <Detail label="Settlement batch">
              <span className="num">{tx.settlementBatch ?? "—"}</span>
            </Detail>
            <Detail label="Payout expected">{tx.payoutExpectedOn ?? "—"}</Detail>
            <Detail label="Settled on">{tx.settledOn ?? "Not yet"}</Detail>
            {tx.refundedAmount ? <Detail label="Refunded">{money(tx.refundedAmount)}</Detail> : null}
          </dl>
          {tx.notice && (
            <Callout tone={tx.status === "declined" || tx.status === "expired" ? "warning" : "info"} className="mt-4">
              {tx.notice}
            </Callout>
          )}
        </AdminCard>

        <AdminCard title="Provider event log">
          <ol className="flex flex-col gap-3">
            {tx.events.map((e, i) => (
              <li key={`${e.at}-${i}`} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <p className="text-[14px] font-semibold text-ink">{e.label}</p>
                <p className="num text-[12px] text-grey">
                  {e.at} · {e.actor}
                </p>
                {e.note && <p className="mt-0.5 text-[13px] text-grey">{e.note}</p>}
              </li>
            ))}
          </ol>
        </AdminCard>
      </div>

      <AdminCard title="Refunds on this payment" className="mt-4">
        {refunds.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-grey">No refund recorded. {REFUND_TIMING}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                pushToast({
                  tone: "neutral",
                  title: "Refund draft opened",
                  body: "Prototype only — Finance would complete this on the refunds screen.",
                })
              }
            >
              Start a refund
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {refunds.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-cream/70 px-3 py-2">
                <div>
                  <p className="num font-semibold">{money(r.amount)}</p>
                  <p className="text-[12px] text-grey">{r.reason}</p>
                </div>
                <Badge tone={REFUND_STATUS[r.status].tone} icon={REFUND_STATUS[r.status].icon} soft>
                  {REFUND_STATUS[r.status].label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <p className="mt-4 text-[12px] text-grey">{meta.blurb} {PROTOTYPE_RULES.refundTimingLabel}</p>
    </AdminShell>
  );
}

function ButtonLinkSafe() {
  return (
    <Link href="/admin/payments" className="inline-flex h-9 items-center rounded-full bg-cta px-4 text-[13px] font-semibold text-white">
      All payments
    </Link>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium text-ink">{children}</dd>
    </div>
  );
}

export function RefundsScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [rows, setRows] = useState(REFUND_REQUESTS);
  const [filter, setFilter] = useState("all");

  const visible = rows.filter((r) => filter === "all" || r.status === filter);
  const paged = usePaged(visible, 8);

  const act = (row: RefundRequest, next: RefundStatus) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    pushToast({
      tone: next === "rejected" ? "warning" : "success",
      title: next === "rejected" ? "Refund rejected" : `Refund ${REFUND_STATUS[next].label.toLowerCase()}`,
      body: `${row.orderCode} · ${money(row.amount)}. ${REFUND_TIMING}`,
    });
  };

  const columns: Column<RefundRequest>[] = [
    { key: "order", header: "Order", render: (r) => <span className="num font-semibold">{r.orderCode}</span> },
    { key: "customer", header: "Customer", render: (r) => r.customer },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (r) => (
        <span className="num font-semibold">
          {money(r.amount)}
          {r.amount !== r.orderTotal && <span className="ml-1 font-normal text-grey">of {money(r.orderTotal)}</span>}
        </span>
      ),
    },
    {
      key: "origin",
      header: "Origin",
      render: (r) => (
        <Badge tone={r.origin === "automatic" ? "info" : "neutral"} soft>
          {r.origin === "automatic" ? "Automatic" : "Manual"}
        </Badge>
      ),
    },
    { key: "reason", header: "Reason", render: (r) => <span className="text-[13px]">{r.reason}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={REFUND_STATUS[r.status].tone} icon={REFUND_STATUS[r.status].icon} soft>
          {REFUND_STATUS[r.status].label}
        </Badge>
      ),
    },
    {
      key: "act",
      header: "Action",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => act(r, "approved")}>
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act(r, "rejected")}>
              Reject
            </Button>
          </div>
        ) : r.status === "approved" ? (
          <Button size="sm" variant="secondary" onClick={() => act(r, "processing")}>
            Send to bank
          </Button>
        ) : (
          <span className="text-[12px] text-grey">{r.bankReference ?? r.requestedBy}</span>
        ),
    },
  ];

  return (
    <AdminShell
      title="Refunds"
      description="Automatic refunds from a branch rejection sit next to manual requests. Finance still has to confirm any OXPay reversal that cannot auto-reverse."
      actions={<StateSwitch state={state} onChange={setState} />}
    >
      <Toolbar label="Filter refunds">
        <FilterSelect
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[{ value: "all", label: "All" }, ...Object.entries(REFUND_STATUS).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
      </Toolbar>
      <p className="mt-3 text-[13px] text-grey">{REFUND_TIMING}</p>
      {state === "loading" && <TableSkeleton cols={7} caption="Refunds" />}
      {state === "empty" && (
        <div className="mt-4">
          <EmptyState icon="refund" title="No refunds queued" compact />
        </div>
      )}
      {state === "error" && (
        <div className="mt-4">
          <ErrorState title="Refund queue unavailable" body={`Quote ${errorRef("RFN")} to support.`} />
        </div>
      )}
      {state === "ready" && (
        <>
          <div className="mt-3">
            <DataTable caption="Refund requests" columns={columns} rows={paged.slice} />
          </div>
          <Pagination page={paged.page} pages={paged.pages} total={paged.total} onPage={paged.setPage} />
        </>
      )}
    </AdminShell>
  );
}

export function ReportsScreen() {
  const exportFile = useSimulatedExport();
  const [range, setRange] = useState("today");
  const empty = range === "empty";

  const hourData = DASHBOARD.ordersByHour.map((h) => ({
    label: h.hour,
    values: [h.ss15, h.taylors],
  }));

  const mix = DASHBOARD.topProducts.map((p) => ({
    label: p.name.split(" ")[0]!,
    values: [p.units],
  }));

  const rejected = MOCK_ORDERS.filter((o) => o.status === "REJECTED" || o.status === "FAILED").length;
  const refunded = REFUND_REQUESTS.filter((r) => r.status === "completed").length;
  const promoRevenue = Object.values(PROMO_META).reduce((n, p) => n + p.revenue, 0);

  return (
    <AdminShell
      title="Reports"
      description="Typed mock figures for a dinner service, not a live warehouse. Use them to review layout, not to make payroll decisions."
      actions={
        <>
          <FilterSelect
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: "today", label: "Today · 21 Sep" },
              { value: "week", label: "This week" },
              { value: "empty", label: "No data in range" },
            ]}
          />
          <Button size="sm" variant="secondary" onClick={() => exportFile("PDF", "Evening service report")}>
            Export PDF
          </Button>
        </>
      }
    >
      {empty ? (
        <EmptyState icon="chart" title="No orders in this range" body="Pick today or this week to load the mock figures." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" value={money(DASHBOARD.revenueToday)} delta={8} icon="chart" />
            <StatCard label="Orders" value={DASHBOARD.ordersToday} delta={5} icon="bag" />
            <StatCard label="Avg. ticket" value={money(DASHBOARD.avgOrder)} delta={-2} icon="card" />
            <StatCard label="Refunds completed" value={refunded} delta={12} deltaGoodWhen="down" icon="refund" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <AdminCard title="Orders by hour">
              <BarChart
                caption="Orders by hour, both branches"
                xLabel="Hour"
                yLabel="Orders"
                series={[
                  { name: "SS15", color: color.deep },
                  { name: "Taylor's", color: color.teal },
                ]}
                data={hourData}
              />
            </AdminCard>
            <AdminCard title="Top dishes by units">
              <BarChart
                caption="Units sold"
                xLabel="Dish"
                yLabel="Units"
                series={[{ name: "Units", color: color.cta }]}
                data={mix}
              />
            </AdminCard>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <AdminCard title="Branch mix">
              <ul className="flex flex-col gap-2">
                {DASHBOARD.revenueByBranch.map((b) => (
                  <li key={b.branchId} className="flex items-center justify-between text-[14px]">
                    <span>{b.label}</span>
                    <span className="num font-semibold">{money(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </AdminCard>
            <AdminCard title="Exceptions">
              <p className="text-[13px] text-grey">Rejected or failed tonight</p>
              <p className="num mt-1 font-display text-[26px] font-bold">{rejected}</p>
              <p className="mt-3 text-[13px] text-grey">Promo-attributed revenue (mock)</p>
              <p className="num mt-1 font-semibold">{money(promoRevenue)}</p>
            </AdminCard>
            <AdminCard title="Customers in the book">
              <p className="num font-display text-[26px] font-bold">{CUSTOMERS.length}</p>
              <p className="mt-1 text-[13px] text-grey">
                Across {BRANCHES.length} live branches. Repeat tags live on the customers screen.
              </p>
            </AdminCard>
          </div>
        </>
      )}
    </AdminShell>
  );
}
