"use client";

/** /admin/menu — menu management table with a drawer editor and bulk actions. */

import { useMemo, useState } from "react";
import { BRANCHES, CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { AVAILABILITY } from "@/lib/status";
import { useStore } from "@/lib/store";
import type { Availability, Product } from "@/lib/types";
import { AdminShell } from "@/components/admin/shell";
import { DataTable, Pagination, type Column } from "@/components/ui/data";
import { ConfirmDialog, Dialog } from "@/components/ui/overlays";
import { Badge, Button, Callout, EmptyState, ErrorState } from "@/components/ui/primitives";
import { SelectField, Toggle } from "@/components/ui/forms";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  BulkBar,
  FilterSearch,
  FilterSelect,
  ResultCount,
  RowCheckbox,
  StateSwitch,
  TableSkeleton,
  Toolbar,
  errorRef,
  useAnnounce,
  usePaged,
  useScreenState,
} from "./config-shared";
import { MenuEditorDrawer, type MenuOverlay } from "./catalogue-menu-drawer";
import { hasOverride, priceAt, spiceLabel } from "./catalogue-data";

const BLANK_DISH: Product = {
  id: "p-new",
  slug: "new-dish",
  categoryId: "signature",
  name: "",
  description: "",
  longDescription: "",
  price: 1600,
  image: "/images/food/new-dish.jpg",
  tags: [],
  spiceLevel: 0,
  allergens: [],
  muslimFriendly: true,
  popular: false,
  signature: false,
  optionGroupIds: ["size", "sauce"],
  availability: { ss15: "available", taylors: "available" },
  kcal: 0,
};

function AvailChip({ state }: { state: Availability }) {
  const meta = AVAILABILITY[state];
  return (
    <Badge tone={meta.tone} icon={meta.icon} soft>
      {meta.label}
    </Badge>
  );
}

export function MenuScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [live, announce] = useAnnounce();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [branch, setBranch] = useState("all");
  const [availability, setAvailability] = useState("all");

  const [overlays, setOverlays] = useState<Record<string, MenuOverlay>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [bulkCategory, setBulkCategory] = useState(CATEGORIES[0].id);
  const [soldOutDialog, setSoldOutDialog] = useState(false);
  const [soldOutBranch, setSoldOutBranch] = useState(BRANCHES[0].id);
  const [soldOutPicks, setSoldOutPicks] = useState<string[]>([]);
  const [confirmSoldOut, setConfirmSoldOut] = useState(false);

  const merged = useMemo(
    () =>
      PRODUCTS.map((p) => {
        const o = overlays[p.id];
        return {
          ...p,
          name: o?.name ?? p.name,
          categoryId: o?.categoryId ?? p.categoryId,
          price: o?.price ?? p.price,
          availability: o?.availability ?? p.availability,
          spiceLevel: o?.spiceLevel ?? p.spiceLevel,
          tags: o?.tags ?? p.tags,
          active: o?.active ?? true,
        };
      }),
    [overlays],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (q && !`${p.name} ${p.koreanName ?? ""} ${p.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      if (availability !== "all") {
        const states = branch === "all" ? BRANCHES.map((b) => p.availability[b.id]) : [p.availability[branch]];
        if (!states.includes(availability as Availability)) return false;
      }
      return true;
    });
  }, [merged, category, query, availability, branch]);

  const paged = usePaged(rows, 8);
  const shownBranches = branch === "all" ? BRANCHES : BRANCHES.filter((b) => b.id === branch);
  const soldOutToday = merged.filter((p) =>
    BRANCHES.some((b) => p.availability[b.id] === "sold_out"),
  ).length;

  const patchOverlay = (id: string, patch: MenuOverlay) =>
    setOverlays((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const toggleActive = (p: (typeof merged)[number]) => {
    patchOverlay(p.id, { active: !p.active });
    announce(`${p.name} ${p.active ? "unpublished" : "published"}.`);
    pushToast({
      tone: p.active ? "warning" : "success",
      title: p.active ? `${p.name} unpublished` : `${p.name} published`,
      body: p.active
        ? "Customers can no longer see or order this dish."
        : "The dish is live on the customer menu again.",
    });
  };

  const bulkSoldOut = () => {
    const names = selected.map((id) => merged.find((p) => p.id === id)?.name).filter(Boolean);
    for (const id of selected) {
      const current = merged.find((p) => p.id === id);
      if (!current) continue;
      patchOverlay(id, {
        availability: Object.fromEntries(
          BRANCHES.map((b) => [b.id, branch === "all" || b.id === branch ? "sold_out" : current.availability[b.id]]),
        ) as Record<string, Availability>,
      });
    }
    announce(`${names.length} dishes marked sold out.`);
    pushToast({
      tone: "warning",
      title: `${names.length} ${names.length === 1 ? "dish" : "dishes"} marked sold out`,
      body: "They return to available at the daily reset time tomorrow morning.",
    });
    setSelected([]);
  };

  const bulkPublish = () => {
    for (const id of selected) patchOverlay(id, { active: true });
    announce(`${selected.length} dishes published.`);
    pushToast({
      tone: "success",
      title: `${selected.length} ${selected.length === 1 ? "dish" : "dishes"} published`,
      body: "They are visible on the customer menu at both branches.",
    });
    setSelected([]);
  };

  const applyBulkCategory = () => {
    for (const id of selected) patchOverlay(id, { categoryId: bulkCategory });
    const label = CATEGORIES.find((c) => c.id === bulkCategory)?.name;
    announce(`${selected.length} dishes moved to ${label}.`);
    pushToast({
      tone: "success",
      title: `Moved to ${label}`,
      body: `${selected.length} ${selected.length === 1 ? "dish" : "dishes"} changed category.`,
    });
    setSelected([]);
    setCategoryDialog(false);
  };

  const applySoldOutToday = () => {
    for (const id of soldOutPicks) {
      const current = merged.find((p) => p.id === id);
      if (!current) continue;
      patchOverlay(id, {
        availability: { ...current.availability, [soldOutBranch]: "sold_out" },
      });
    }
    const branchName = BRANCHES.find((b) => b.id === soldOutBranch)?.shortName;
    announce(`${soldOutPicks.length} dishes sold out at ${branchName} for today.`);
    pushToast({
      tone: "warning",
      title: `Sold out today at ${branchName}`,
      body: `${soldOutPicks.length} ${soldOutPicks.length === 1 ? "dish" : "dishes"} hidden from ordering until the 09:30 reset tomorrow.`,
    });
    setSoldOutPicks([]);
    setSoldOutDialog(false);
  };

  const columns: Column<(typeof merged)[number]>[] = [
    {
      key: "select",
      header: "Select",
      width: "52px",
      render: (row) => (
        <RowCheckbox
          checked={selected.includes(row.id)}
          label={`Select ${row.name}`}
          onChange={(v) =>
            setSelected((prev) => (v ? [...prev, row.id] : prev.filter((x) => x !== row.id)))
          }
        />
      ),
    },
    {
      key: "dish",
      header: "Dish",
      render: (row) => (
        <div className="flex items-center gap-3">
          <FoodImage
            src={row.image}
            alt={`${row.name || "Untitled dish"} photograph`}
            className="size-11 shrink-0"
            rounded="rounded-[10px]"
          />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-ink">
              {row.name || "Untitled dish"}
            </p>
            <p className="truncate text-[12px] text-grey">
              {row.koreanName ? `${row.koreanName} · ` : ""}
              {row.active ? "Published" : "Hidden from customers"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="text-[13px] text-ink">
          {CATEGORIES.find((c) => c.id === row.categoryId)?.name}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      render: (row) => (
        <div>
          <p className="num text-[14px] font-semibold text-ink">{money(row.price)}</p>
          {BRANCHES.some((b) => hasOverride(row, b.id)) && (
            <p className="num text-[11px] text-grey">
              {BRANCHES.filter((b) => hasOverride(row, b.id))
                .map((b) => `${b.shortName} ${money(priceAt(row, b.id))}`)
                .join(" · ")}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      render: (row) => (
        <ul className="flex flex-col gap-1">
          {shownBranches.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-grey">
                {b.shortName === "SS15" ? "SS15" : "TLC"}
              </span>
              <AvailChip state={row.availability[b.id]} />
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "spice",
      header: "Spice",
      render: (row) => <span className="text-[13px] text-ink">{spiceLabel(row.spiceLevel)}</span>,
      hideAtLaptop: true,
    },
    {
      key: "tags",
      header: "Tags",
      render: (row) =>
        row.tags.length === 0 ? (
          <span className="text-[13px] text-grey">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.tags.slice(0, 2).map((t) => (
              <Badge key={t} tone="neutral" soft>
                {t}
              </Badge>
            ))}
            {row.tags.length > 2 && (
              <span className="num text-[12px] text-grey">+{row.tags.length - 2}</span>
            )}
          </div>
        ),
      hideAtLaptop: true,
    },
    {
      key: "active",
      header: "Published",
      align: "center",
      render: (row) => (
        <span onClick={(e) => e.stopPropagation()} className="inline-block">
          <button
            type="button"
            role="switch"
            aria-checked={row.active}
            aria-label={`${row.name || "Untitled dish"} published on the customer menu`}
            onClick={() => toggleActive(row)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              row.active ? "bg-deep" : "bg-grey/40"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                row.active ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </span>
      ),
    },
    {
      key: "edit",
      header: "Edit",
      align: "right",
      width: "72px",
      render: () => (
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-deep">
          Open
          <Icon name="chevronRight" size={14} />
        </span>
      ),
    },
  ];

  return (
    <AdminShell
      title="Menu management"
      description="Every dish across both branches: pricing, stock, options and what customers can see right now."
      actions={
        <>
          <StateSwitch state={state} onChange={setState} />
          <Button
            size="sm"
            variant="secondary"
            iconStart="clock"
            onClick={() => setSoldOutDialog(true)}
          >
            Sold out today
          </Button>
          <Button size="sm" variant="primary" iconStart="plus" onClick={() => setEditing(BLANK_DISH)}>
            New dish
          </Button>
        </>
      }
    >
      {live}

      <div className="flex flex-col gap-4">
        {soldOutToday > 0 && state === "ready" && (
          <Callout tone="warning" icon="alert" title={`${soldOutToday} dishes are sold out somewhere today`}>
            Sold-out dishes stay on the menu but cannot be added to a cart. Everything resets at
            09:30 tomorrow.
          </Callout>
        )}

        <Toolbar label="Filter the menu">
          <FilterSearch
            label="Search dishes"
            value={query}
            onChange={setQuery}
            placeholder="Yangnyeom, tteokbokki, set…"
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
          <FilterSelect
            label="Branch"
            value={branch}
            onChange={setBranch}
            options={[
              { value: "all", label: "Both branches" },
              ...BRANCHES.map((b) => ({ value: b.id, label: b.shortName })),
            ]}
          />
          <FilterSelect
            label="Availability"
            value={availability}
            onChange={setAvailability}
            options={[
              { value: "all", label: "Any state" },
              { value: "available", label: "Available" },
              { value: "low", label: "Low stock" },
              { value: "sold_out", label: "Sold out" },
            ]}
          />
        </Toolbar>

        <BulkBar count={selected.length} onClear={() => setSelected([])}>
          <Button size="sm" variant="secondary" iconStart="cross" onClick={() => setConfirmSoldOut(true)}>
            Mark sold out
          </Button>
          <Button size="sm" variant="secondary" iconStart="check" onClick={bulkPublish}>
            Publish
          </Button>
          <Button size="sm" variant="secondary" iconStart="list" onClick={() => setCategoryDialog(true)}>
            Change category
          </Button>
        </BulkBar>

        <ResultCount>
          {state === "loading"
            ? "Loading the menu…"
            : `${rows.length} of ${PRODUCTS.length} dishes${
                branch === "all" ? "" : ` · ${BRANCHES.find((b) => b.id === branch)?.name}`
              }`}
        </ResultCount>

        {state === "loading" && <TableSkeleton cols={7} rows={8} caption="Menu items" />}

        {state === "error" && (
          <ErrorState
            title="The menu could not be loaded"
            body="The catalogue service did not respond. Nothing was changed — try again in a moment."
            requestId={errorRef("MENU")}
            onRetry={() => setState("ready")}
          />
        )}

        {state === "empty" && (
          <EmptyState
            icon="box"
            title="No dishes published yet"
            body="Add your first dish and it will appear on the customer menu at the branches you choose."
            action={
              <Button variant="primary" iconStart="plus" onClick={() => setEditing(BLANK_DISH)}>
                Add the first dish
              </Button>
            }
          />
        )}

        {state === "ready" && (
          <>
            <DataTable
              caption="All menu items with category, price, per-branch availability, spice level, tags and published state"
              columns={columns}
              rows={paged.slice}
              onRowClick={(row) => setEditing(PRODUCTS.find((p) => p.id === row.id) ?? BLANK_DISH)}
              selectedId={editing?.id ?? null}
              emptyTitle="No dishes match these filters"
              emptyBody="Clear a filter or search for something else."
            />
            {paged.pages > 1 && (
              <Pagination
                page={paged.page}
                pages={paged.pages}
                total={paged.total}
                onPage={paged.setPage}
              />
            )}
          </>
        )}
      </div>

      {editing && (
        <MenuEditorDrawer
          key={editing.id}
          product={editing}
          overlay={overlays[editing.id]}
          onClose={() => setEditing(null)}
          onSave={(patch, message) => {
            patchOverlay(editing.id, patch);
            setEditing(null);
            announce(message);
            pushToast({ tone: "success", title: message, body: "Changes are live at both branches." });
          }}
        />
      )}

      <ConfirmDialog
        open={confirmSoldOut}
        onClose={() => setConfirmSoldOut(false)}
        onConfirm={bulkSoldOut}
        title={`Mark ${selected.length} ${selected.length === 1 ? "dish" : "dishes"} sold out?`}
        body={
          <>
            Customers will no longer be able to add{" "}
            {selected.length === 1 ? "this dish" : "these dishes"} to a cart
            {branch === "all"
              ? " at either branch"
              : ` at ${BRANCHES.find((b) => b.id === branch)?.name}`}
            . Anything already in a cart is flagged as unavailable at checkout.
          </>
        }
        confirmLabel="Mark sold out"
        cancelLabel="Keep on sale"
        destructive
      />

      <Dialog
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        title="Change category"
        description={`${selected.length} ${selected.length === 1 ? "dish" : "dishes"} will move. Category order controls where they appear on the customer menu.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCategoryDialog(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={applyBulkCategory}>
              Move dishes
            </Button>
          </>
        }
      >
        <SelectField
          label="New category"
          value={bulkCategory}
          onChange={(e) => setBulkCategory(e.target.value)}
          options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
        />
      </Dialog>

      <Dialog
        open={soldOutDialog}
        onClose={() => setSoldOutDialog(false)}
        title="Sold out today"
        description="The fastest way for a branch manager to take dishes off sale for the rest of the day."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSoldOutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={soldOutPicks.length === 0}
              onClick={applySoldOutToday}
            >
              Mark {soldOutPicks.length} sold out
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Branch"
            value={soldOutBranch}
            onChange={(e) => {
              setSoldOutBranch(e.target.value);
              setSoldOutPicks([]);
            }}
            options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
          />
          <fieldset className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            <legend className="mb-1.5 text-[13px] font-semibold text-ink">
              Dishes still on sale here
            </legend>
            {merged
              .filter((p) => p.availability[soldOutBranch] !== "sold_out")
              .map((p) => (
                <label
                  key={p.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-line px-3 hover:bg-mint/60"
                >
                  <input
                    type="checkbox"
                    checked={soldOutPicks.includes(p.id)}
                    onChange={(e) =>
                      setSoldOutPicks((prev) =>
                        e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id),
                      )
                    }
                    className="size-4.5 accent-[var(--color-cta)]"
                  />
                  <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{p.name}</span>
                  <span className="num shrink-0 text-[13px] text-grey">
                    {money(priceAt(p, soldOutBranch))}
                  </span>
                </label>
              ))}
          </fieldset>
          <Toggle
            label="Reset automatically tomorrow at 09:30"
            description="Prototype business rule. Turn this off only if the dish is off the menu indefinitely."
            checked
            onChange={() =>
              pushToast({
                tone: "neutral",
                title: "Daily reset is managed in Branch inventory",
                body: "Change the reset time there so every branch stays consistent.",
              })
            }
          />
        </div>
      </Dialog>
    </AdminShell>
  );
}
