"use client";

import { useMemo, useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import { CUSTOMERS, PROMOTIONS, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Customer, Promotion } from "@/lib/types";
import { Badge, Button, Callout, EmptyState, ErrorState } from "@/components/ui/primitives";
import { BarChart, DataTable, type Column } from "@/components/ui/data";
import { Drawer } from "@/components/ui/overlays";
import { Toggle } from "@/components/ui/forms";
import { Avatar } from "@/components/ui/media";
import {
  FilterSearch,
  FilterSelect,
  ResultCount,
  StateSwitch,
  TableSkeleton,
  Toolbar,
  errorRef,
  useScreenState,
} from "@/components/admin/config-shared";
import { PROMO_META, PROMO_TYPE_LABEL, type PromoMeta } from "@/components/admin/money-data";
import { color } from "@/lib/tokens";
import { maskEmail, maskPhone } from "@/components/admin/ops-shared";

export function PromotionsScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [meta, setMeta] = useState(PROMO_META);
  const [selected, setSelected] = useState<string>(PROMOTIONS[0]?.id ?? "");
  const promo = PROMOTIONS.find((p) => p.id === selected) ?? PROMOTIONS[0];
  const stats: PromoMeta | undefined = promo ? meta[promo.id] : undefined;

  const toggle = (p: Promotion, active: boolean) => {
    setMeta((prev) => ({ ...prev, [p.id]: { ...prev[p.id]!, active } }));
    pushToast({
      tone: active ? "success" : "warning",
      title: active ? `${p.name} is live` : `${p.name} paused`,
      body: active ? "Customers can apply this offer at checkout." : "Existing carts keep the code until they refresh.",
    });
  };

  return (
    <AdminShell
      title="Promotions"
      description="Codes, windows, caps and a customer-facing preview. Conditions stay next to the discount so a busy cashier can explain them."
      actions={<StateSwitch state={state} onChange={setState} />}
    >
      {state === "loading" && <TableSkeleton cols={5} caption="Promotions" />}
      {state === "empty" && <EmptyState icon="tag" title="No promotions scheduled" compact />}
      {state === "error" && <ErrorState title="Promotions could not load" requestId={errorRef("PROMO")} />}
      {state === "ready" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <ul className="flex flex-col gap-2">
            {PROMOTIONS.map((p) => {
              const m = meta[p.id];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className="w-full rounded-[12px] border border-line bg-white p-3 text-left hover:bg-mint/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{p.name}</p>
                        <p className="num text-[12px] text-grey">{p.code ?? "No code · auto-applied"}</p>
                      </div>
                      <Badge tone={m?.active ? "success" : "neutral"} soft>
                        {m?.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-grey">
                      {PROMO_TYPE_LABEL[p.type]} · {m?.usage ?? 0}/{m?.cap ?? 0} used
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {promo && stats && (
            <AdminCard
              title={promo.name}
              action={
                <Toggle
                  checked={stats.active}
                  onChange={(v) => toggle(promo, v)}
                  label={stats.active ? "Live" : "Paused"}
                />
              }
            >
              <p className="text-[14px] leading-relaxed text-ink/80">{promo.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <dt className="text-grey">Code</dt>
                  <dd className="num font-semibold">{promo.code ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-grey">Min spend</dt>
                  <dd className="num font-semibold">{money(promo.minSpend)}</dd>
                </div>
                <div>
                  <dt className="text-grey">Ends</dt>
                  <dd className="num font-semibold">{promo.endsOn}</dd>
                </div>
                <div>
                  <dt className="text-grey">Branches</dt>
                  <dd className="font-semibold">{promo.branchIds.map((id) => branchById(id).shortName).join(", ")}</dd>
                </div>
              </dl>
              {stats.fulfilment !== "all" && (
                <Callout tone="warning" className="mt-4" title="Fulfilment conflict">
                  This offer only applies to {stats.fulfilment}. Delivery-only codes will be rejected at pickup checkout.
                </Callout>
              )}
              <div className="mt-4">
                <BarChart
                  caption="Weekly redemptions"
                  xLabel="Week"
                  yLabel="Uses"
                  series={[{ name: "Uses", color: color.deep }]}
                  data={stats.usageByWeek.map((n, i) => ({ label: `W${i + 1}`, values: [n] }))}
                />
              </div>
              <ul className="mt-4 list-disc pl-5 text-[13px] text-grey">
                {promo.terms.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </AdminCard>
          )}
        </div>
      )}
    </AdminShell>
  );
}

export function CustomersScreen() {
  const { state, setState } = useScreenState();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [open, setOpen] = useState<Customer | null>(null);

  const rows = useMemo(() => {
    return CUSTOMERS.filter((c) => {
      const q = query.trim().toLowerCase();
      const hit = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
      const byTag = tag === "all" || c.tags.includes(tag);
      return hit && byTag;
    });
  }, [query, tag]);

  const tags = Array.from(new Set(CUSTOMERS.flatMap((c) => c.tags)));

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <span className="flex items-center gap-2">
          <Avatar name={c.name} size={28} />
          {c.name}
        </span>
      ),
    },
    { key: "phone", header: "Phone", render: (c) => <span className="num">{maskPhone(c.phone)}</span> },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      render: (c) => <span className="num">{c.orderCount}</span>,
    },
    {
      key: "spend",
      header: "Lifetime",
      align: "right",
      render: (c) => <span className="num font-semibold">{money(c.lifetimeSpend)}</span>,
    },
    {
      key: "branch",
      header: "Favourite",
      render: (c) => branchById(c.favouriteBranchId).shortName,
    },
    {
      key: "tags",
      header: "Tags",
      render: (c) => (
        <span className="flex flex-wrap gap-1">
          {c.tags.length === 0 ? (
            <span className="text-grey">—</span>
          ) : (
            c.tags.map((t) => (
              <Badge key={t} tone="neutral" soft>
                {t}
              </Badge>
            ))
          )}
        </span>
      ),
    },
  ];

  return (
    <AdminShell
      title="Customers"
      description="Support records only. Phone and email are masked on the list; the drawer shows the full mock values because this is a prototype, not a live PDPA store."
      actions={<StateSwitch state={state} onChange={setState} />}
    >
      <Toolbar label="Filter customers">
        <FilterSearch label="Search" value={query} onChange={setQuery} placeholder="Name, phone or email" />
        <FilterSelect
          label="Tag"
          value={tag}
          onChange={setTag}
          options={[{ value: "all", label: "All tags" }, ...tags.map((t) => ({ value: t, label: t }))]}
        />
      </Toolbar>
      <div className="mt-3">
        <ResultCount>
          {rows.length} customer{rows.length === 1 ? "" : "s"}
        </ResultCount>
      </div>
      {state === "loading" && <TableSkeleton cols={6} caption="Customers" />}
      {state === "empty" && <EmptyState icon="users" title="No matching customers" compact />}
      {state === "error" && <ErrorState title="Customer list unavailable" requestId={errorRef("CUS")} />}
      {state === "ready" && (
        <div className="mt-3">
          <DataTable caption="Customers" columns={columns} rows={rows} onRowClick={setOpen} selectedId={open?.id} />
        </div>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.name ?? "Customer"}
        subtitle={open ? `${open.orderCount} orders · ${money(open.lifetimeSpend)}` : undefined}
      >
        {open && (
          <dl className="flex flex-col gap-3 text-[14px]">
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Phone</dt>
              <dd className="num">{open.phone}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Email</dt>
              <dd>{open.email}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Joined</dt>
              <dd>{open.joinedOn}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-wide text-grey">Favourite branch</dt>
              <dd>{branchById(open.favouriteBranchId).name}</dd>
            </div>
            <Callout tone="info">Masked on the list as {maskEmail(open.email)}. Prototype values only.</Callout>
          </dl>
        )}
      </Drawer>
    </AdminShell>
  );
}
