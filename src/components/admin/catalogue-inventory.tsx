"use client";

/** /admin/inventory — dish × branch stock matrix with the daily reset rules. */

import { useMemo, useState } from "react";
import { BRANCHES, CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { AVAILABILITY } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Availability } from "@/lib/types";
import { AdminShell } from "@/components/admin/shell";
import { ConfirmDialog } from "@/components/ui/overlays";
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  ErrorState,
  Stat,
} from "@/components/ui/primitives";
import { Chip, TextField, Toggle } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import {
  FilterSearch,
  FilterSelect,
  ResultCount,
  StateSwitch,
  TableSkeleton,
  TileSkeleton,
  errorRef,
  useAnnounce,
  useScreenState,
} from "./config-shared";
import { COUNTED_STOCK, DEFAULT_STOCK_RULES } from "./catalogue-data";

type Matrix = Record<string, Record<string, Availability>>;

const SEED: Matrix = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, { ...p.availability }]),
) as Matrix;

export function InventoryScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [live, announce] = useAnnounce();

  const [matrix, setMatrix] = useState<Matrix>(SEED);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [threshold, setThreshold] = useState(DEFAULT_STOCK_RULES.lowStockThreshold);
  const [autoSoldOut, setAutoSoldOut] = useState(DEFAULT_STOCK_RULES.autoSoldOutAtZero);
  const [resetTime, setResetTime] = useState(DEFAULT_STOCK_RULES.dailyResetTime);
  const [confirmReset, setConfirmReset] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (onlyProblems && !BRANCHES.some((b) => matrix[p.id][b.id] !== "available")) return false;
      return true;
    });
  }, [query, category, onlyProblems, matrix]);

  const counts = useMemo(() => {
    let soldOut = 0;
    let low = 0;
    let available = 0;
    for (const p of PRODUCTS) {
      for (const b of BRANCHES) {
        const s = matrix[p.id][b.id];
        if (s === "sold_out") soldOut += 1;
        else if (s === "low") low += 1;
        else available += 1;
      }
    }
    return { soldOut, low, available };
  }, [matrix]);

  const setCell = (productId: string, branchId: string, value: Availability) => {
    setMatrix((prev) => ({ ...prev, [productId]: { ...prev[productId], [branchId]: value } }));
    const dish = PRODUCTS.find((p) => p.id === productId)?.name;
    const branch = BRANCHES.find((b) => b.id === branchId)?.shortName;
    announce(`${dish} at ${branch} set to ${AVAILABILITY[value].label}.`);
  };

  const resetAll = () => {
    setMatrix(
      Object.fromEntries(
        PRODUCTS.map((p) => [p.id, Object.fromEntries(BRANCHES.map((b) => [b.id, "available"]))]),
      ) as Matrix,
    );
    announce("All dishes reset to available for tomorrow at both branches.");
    pushToast({
      tone: "success",
      title: "Stock reset for tomorrow",
      body: `Every dish is available again at both branches from ${resetTime}.`,
    });
    setConfirmReset(false);
  };

  const soldOutEverywhere = PRODUCTS.filter((p) =>
    BRANCHES.every((b) => matrix[p.id][b.id] === "sold_out"),
  );

  return (
    <AdminShell
      title="Branch inventory"
      description="What each kitchen can actually cook right now. Changes reach the customer menu immediately."
      actions={
        <>
          <StateSwitch state={state} onChange={setState} />
          <Button
            size="sm"
            variant="secondary"
            iconStart="refund"
            onClick={() => setConfirmReset(true)}
          >
            Reset all for tomorrow
          </Button>
        </>
      }
    >
      {live}

      <div className="flex flex-col gap-4">
        {state === "loading" ? (
          <TileSkeleton count={3} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Available"
              value={counts.available}
              sub={`across ${BRANCHES.length} branches`}
              icon="check"
            />
            <Stat
              label="Low stock"
              value={counts.low}
              sub={`at or under ${threshold} portions`}
              tone="warning"
              icon="alert"
            />
            <Stat label="Sold out" value={counts.soldOut} sub="hidden from ordering" icon="cross" />
          </div>
        )}

        {soldOutEverywhere.length > 0 && state === "ready" && (
          <Callout
            tone="warning"
            icon="alert"
            title={`${soldOutEverywhere.length} ${soldOutEverywhere.length === 1 ? "dish is" : "dishes are"} sold out at every branch`}
          >
            {soldOutEverywhere.map((p) => p.name).join(", ")}. Customers cannot order{" "}
            {soldOutEverywhere.length === 1 ? "it" : "them"} anywhere until stock returns.
          </Callout>
        )}

        {/* ---------------- Stock rules ---------------- */}
        <section
          aria-labelledby="stock-rules"
          className="rounded-[14px] border border-line bg-white p-4"
        >
          <h2 id="stock-rules" className="text-[15px]">
            Stock rules
          </h2>
          <p className="mt-0.5 text-[13px] text-grey">
            These rules apply to both branches. Kitchen staff can still override any single dish.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <TextField
              label="Low-stock threshold"
              type="number"
              min={1}
              max={50}
              value={threshold}
              suffix="portions"
              hint="Below this count a dish is flagged low so the kitchen can prep more."
              onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))}
            />
            <TextField
              label="Daily reset time"
              type="time"
              value={resetTime}
              hint="Everything marked sold out today returns to available at this time."
              onChange={(e) => setResetTime(e.target.value)}
            />
            <div className="self-center">
              <Toggle
                label="Automatically sell out at zero"
                description="When a counted portion hits zero the dish is hidden from ordering without anyone touching this screen."
                checked={autoSoldOut}
                onChange={(v) => {
                  setAutoSoldOut(v);
                  announce(
                    v
                      ? "Automatic sold out at zero is on."
                      : "Automatic sold out at zero is off — staff must mark dishes manually.",
                  );
                }}
              />
            </div>
          </div>
        </section>

        {/* ---------------- Filters ---------------- */}
        <div className="flex flex-wrap items-end gap-3 rounded-[14px] border border-line bg-white p-3">
          <FilterSearch
            label="Search dishes"
            value={query}
            onChange={setQuery}
            placeholder="Tteokbokki, corn dog…"
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: "all", label: "All categories" },
              ...CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-grey">Show</span>
            <Chip active={onlyProblems} icon="alert" onClick={() => setOnlyProblems((v) => !v)}>
              Low or sold out only
            </Chip>
          </div>
        </div>

        <ResultCount>
          {state === "loading"
            ? "Loading stock…"
            : `${rows.length} of ${PRODUCTS.length} dishes shown`}
        </ResultCount>

        {state === "loading" && <TableSkeleton cols={4} rows={8} caption="Branch inventory matrix" />}

        {state === "error" && (
          <ErrorState
            title="Stock could not be loaded"
            body="The kitchen tablets keep their last known state, so nothing oversells while this screen is down."
            requestId={errorRef("INV")}
            onRetry={() => setState("ready")}
          />
        )}

        {state === "empty" && (
          <EmptyState
            icon="bag"
            title="Nothing to count yet"
            body="Publish a dish on the menu and it will appear here for each branch."
          />
        )}

        {state === "ready" && (
          <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                Availability of every dish at each branch, with the counted portions remaining and a
                control to change the state
              </caption>
              <thead>
                <tr className="border-b border-line bg-cream/60">
                  <th
                    scope="col"
                    className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-grey"
                  >
                    Dish
                  </th>
                  {BRANCHES.map((b) => (
                    <th
                      key={b.id}
                      scope="col"
                      className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-grey"
                    >
                      {b.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={BRANCHES.length + 1} className="px-4 py-12 text-center">
                      <p className="text-[15px] font-semibold text-ink">No dishes match</p>
                      <p className="mt-1 text-[13px] text-grey">
                        Clear the filters to see the full matrix.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="px-4 py-3 text-left align-middle">
                        <span className="block text-[14px] font-semibold text-ink">{p.name}</span>
                        <span className="block text-[12px] text-grey">
                          {CATEGORIES.find((c) => c.id === p.categoryId)?.name}
                        </span>
                      </th>
                      {BRANCHES.map((b) => (
                        <td key={b.id} className="px-4 py-3 align-middle">
                          <StockCell
                            cellId={`${p.id}-${b.id}`}
                            dish={p.name}
                            branch={b.name}
                            value={matrix[p.id][b.id]}
                            stock={COUNTED_STOCK[p.id][b.id]}
                            threshold={threshold}
                            onChange={(v) => setCell(p.id, b.id, v)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAll}
        title="Reset every dish for tomorrow?"
        body={`All ${PRODUCTS.length} dishes at both branches return to available from ${resetTime}. Use this at close of business — anything genuinely out of stock has to be marked again in the morning.`}
        confirmLabel="Reset all stock"
        cancelLabel="Leave as is"
      />
    </AdminShell>
  );
}

function StockCell({
  cellId,
  dish,
  branch,
  value,
  stock,
  threshold,
  onChange,
}: {
  cellId: string;
  dish: string;
  branch: string;
  value: Availability;
  stock: number;
  threshold: number;
  onChange: (v: Availability) => void;
}) {
  const meta = AVAILABILITY[value];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={meta.tone} icon={meta.icon} soft>
        {meta.label}
      </Badge>
      <div className="relative">
        <label className="sr-only" htmlFor={`stock-${cellId}`}>
          Availability of {dish} at {branch}
        </label>
        <select
          id={`stock-${cellId}`}
          value={value}
          onChange={(e) => onChange(e.target.value as Availability)}
          className="h-9 appearance-none rounded-[9px] border border-line bg-white pl-2.5 pr-7 text-[13px] font-medium text-ink focus:border-ink"
        >
          <option value="available">Available</option>
          <option value="low">Low stock</option>
          <option value="sold_out">Sold out</option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-grey">
          <Icon name="chevronDown" size={14} />
        </span>
      </div>
      <span
        className={cn(
          "num text-[12px]",
          stock === 0 ? "font-semibold text-black" : stock <= threshold ? "font-semibold text-black" : "text-grey",
        )}
      >
        {stock} left
      </span>
    </div>
  );
}
