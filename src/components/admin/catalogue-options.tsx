"use client";

/** /admin/options — option groups, selection rules and values with price deltas. */

import { useMemo, useState } from "react";
import { BRANCHES, OPTION_GROUPS, PRODUCTS } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/shell";
import { ConfirmDialog, Dialog } from "@/components/ui/overlays";
import {
  Badge,
  Button,
  Callout,
  Divider,
  EmptyState,
  ErrorState,
} from "@/components/ui/primitives";
import { Segmented, TextField, Toggle } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import {
  CardSkeleton,
  DirtyFlag,
  FieldGrid,
  MoneyField,
  ResultCount,
  StateSwitch,
  SubHeading,
  errorRef,
  useAnnounce,
  useScreenState,
} from "./config-shared";
import { dishesUsing } from "./catalogue-data";

interface ValueRow {
  id: string;
  name: string;
  priceDelta: number;
  soldOutAt: string[];
}

interface GroupRow {
  id: string;
  name: string;
  helper: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  values: ValueRow[];
  attached: string[];
}

const EXTRA_GROUPS: GroupRow[] = [
  {
    id: "rice",
    name: "Rice choice",
    helper: "Choose 1 — sets only",
    required: true,
    minSelect: 1,
    maxSelect: 1,
    values: [
      { id: "rice-steamed", name: "Steamed white rice", priceDelta: 0, soldOutAt: [] },
      { id: "rice-garlic", name: "Garlic butter rice", priceDelta: 150, soldOutAt: [] },
      { id: "rice-brown", name: "Brown rice", priceDelta: 200, soldOutAt: ["taylors"] },
      { id: "rice-none", name: "No rice", priceDelta: 0, soldOutAt: [] },
    ],
    attached: ["p-set-soy", "p-set-yangnyeom"],
  },
  {
    id: "drinksize",
    name: "Drink size",
    helper: "Choose 1",
    required: true,
    minSelect: 1,
    maxSelect: 1,
    values: [
      { id: "ds-regular", name: "Regular", priceDelta: 0, soldOutAt: [] },
      { id: "ds-large", name: "Large", priceDelta: 200, soldOutAt: [] },
    ],
    attached: ["p-yuzu", "p-barley", "p-strawberry"],
  },
];

const SEEDED: GroupRow[] = [
  ...OPTION_GROUPS.map((g) => ({
    id: g.id,
    name: g.name,
    helper: g.helper ?? "",
    required: g.required,
    minSelect: g.minSelect,
    maxSelect: g.maxSelect,
    values: g.choices.map((c) => ({
      id: c.id,
      name: c.name,
      priceDelta: c.priceDelta,
      soldOutAt: c.soldOutAt ?? [],
    })),
    attached: dishesUsing(g.id).map((p) => p.id),
  })),
  ...EXTRA_GROUPS,
];

export function OptionsScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [live, announce] = useAnnounce();
  const [groups, setGroups] = useState<GroupRow[]>(SEEDED);
  const [activeId, setActiveId] = useState(SEEDED[0].id);
  const [dirty, setDirty] = useState(false);
  const [newValueOpen, setNewValueOpen] = useState(false);
  const [removing, setRemoving] = useState<GroupRow | null>(null);
  const [conflict, setConflict] = useState<GroupRow | null>(null);

  const active = groups.find((g) => g.id === activeId) ?? groups[0];
  const attachedDishes = useMemo(
    () => active.attached.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean),
    [active],
  );

  const patchActive = (patch: Partial<GroupRow>) => {
    setGroups((prev) => prev.map((g) => (g.id === active.id ? { ...g, ...patch } : g)));
    setDirty(true);
  };

  const patchValue = (valueId: string, patch: Partial<ValueRow>) =>
    patchActive({
      values: active.values.map((v) => (v.id === valueId ? { ...v, ...patch } : v)),
    });

  const save = () => {
    setDirty(false);
    announce(`${active.name} saved with ${active.values.length} values.`);
    pushToast({
      tone: "success",
      title: `${active.name} saved`,
      body: `Applied to ${active.attached.length} ${active.attached.length === 1 ? "dish" : "dishes"} at both branches.`,
    });
  };

  const requestRemove = (group: GroupRow) => {
    if (group.attached.length > 0) setConflict(group);
    else setRemoving(group);
  };

  const remove = (group: GroupRow) => {
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    if (group.id === activeId) setActiveId(groups.find((g) => g.id !== group.id)?.id ?? "");
    announce(`${group.name} removed.`);
    pushToast({
      tone: "warning",
      title: `${group.name} removed`,
      body: "Dishes that used it no longer show the question at checkout.",
    });
    setRemoving(null);
    setConflict(null);
  };

  return (
    <AdminShell
      title="Options & add-ons"
      description="Shared questions customers answer when they add a dish: sauce, spice, rice, add-ons and sizes."
      actions={
        <>
          <StateSwitch state={state} onChange={setState} />
          <Button
            size="sm"
            variant="primary"
            iconStart="plus"
            onClick={() =>
              pushToast({
                tone: "neutral",
                title: "New group",
                body: "Creating a group from scratch is out of scope for this prototype — edit one of the existing groups instead.",
              })
            }
          >
            New group
          </Button>
        </>
      }
    >
      {live}

      {state === "loading" && (
        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <CardSkeleton lines={6} />
          <CardSkeleton lines={9} />
        </div>
      )}

      {state === "error" && (
        <ErrorState
          title="Option groups could not be loaded"
          body="Dishes still work — customers see their saved options until this screen recovers."
          requestId={errorRef("OPT")}
          onRetry={() => setState("ready")}
        />
      )}

      {state === "empty" && (
        <EmptyState
          icon="filter"
          title="No option groups yet"
          body="Option groups let one dish offer sauces, spice levels and add-ons without duplicating it."
        />
      )}

      {state === "ready" && (
        <div className="grid items-start gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* ---------------- Group list ---------------- */}
          <section
            aria-labelledby="group-list-title"
            className="rounded-[14px] border border-line bg-white"
          >
            <div className="border-b border-line px-4 py-3">
              <h2 id="group-list-title" className="text-[15px]">
                Option groups
              </h2>
              <ResultCount>{groups.length} groups</ResultCount>
            </div>
            <ul className="p-2">
              {groups.map((g) => {
                const current = g.id === active.id;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      aria-current={current ? "true" : undefined}
                      onClick={() => setActiveId(g.id)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                        current ? "bg-ink text-white" : "text-ink hover:bg-mint",
                      )}
                    >
                      <span className="flex items-center gap-2 text-[14px] font-semibold">
                        {g.name}
                        {g.required && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                              current ? "bg-white/20 text-white" : "bg-yellow/40 text-black",
                            )}
                          >
                            Required
                          </span>
                        )}
                      </span>
                      <span
                        className={cn("num text-[12px]", current ? "text-white/70" : "text-grey")}
                      >
                        {g.values.length} values · attached to {g.attached.length} dishes
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ---------------- Nested editor ---------------- */}
          <div className="flex flex-col gap-4">
            <section
              aria-labelledby="group-editor-title"
              className="rounded-[14px] border border-line bg-white"
            >
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                <div className="min-w-0 flex-1">
                  <h2 id="group-editor-title" className="text-[15px]">
                    {active.name}
                  </h2>
                  <p className="text-[12px] text-grey">
                    Attached to {active.attached.length}{" "}
                    {active.attached.length === 1 ? "dish" : "dishes"}
                  </p>
                </div>
                <DirtyFlag dirty={dirty} />
                <Button size="sm" variant="dark" onClick={save} disabled={!dirty} iconStart="check">
                  Save group
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  iconStart="trash"
                  onClick={() => requestRemove(active)}
                >
                  Remove
                </Button>
              </div>

              <div className="flex flex-col gap-4 p-4">
                <FieldGrid>
                  <TextField
                    label="Group name"
                    value={active.name}
                    hint="Shown as the question heading on the dish page."
                    onChange={(e) => patchActive({ name: e.target.value })}
                  />
                  <TextField
                    label="Helper text"
                    value={active.helper}
                    hint="Small line under the heading, for example “Choose 1”."
                    onChange={(e) => patchActive({ helper: e.target.value })}
                  />
                </FieldGrid>

                <Divider />

                <div>
                  <SubHeading note="Single lets the customer pick one value. Multiple lets them tick several, up to the maximum.">
                    Selection rule
                  </SubHeading>
                  <Segmented<string>
                    label="Selection mode"
                    size="sm"
                    value={active.maxSelect > 1 ? "multiple" : "single"}
                    onChange={(v) =>
                      patchActive(
                        v === "multiple"
                          ? { maxSelect: Math.max(2, active.values.length), minSelect: 0 }
                          : { maxSelect: 1, minSelect: active.required ? 1 : 0 },
                      )
                    }
                    options={[
                      { value: "single", label: "Single choice" },
                      { value: "multiple", label: "Multiple choice" },
                    ]}
                  />
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <TextField
                      label="Minimum selections"
                      type="number"
                      min={0}
                      max={active.maxSelect}
                      value={active.minSelect}
                      onChange={(e) =>
                        patchActive({ minSelect: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                    <TextField
                      label="Maximum selections"
                      type="number"
                      min={1}
                      max={active.values.length}
                      value={active.maxSelect}
                      onChange={(e) =>
                        patchActive({ maxSelect: Math.max(1, Number(e.target.value) || 1) })
                      }
                    />
                    <div className="self-end">
                      <Toggle
                        label="Required"
                        description="The customer cannot add the dish without answering."
                        checked={active.required}
                        onChange={(v) =>
                          patchActive({ required: v, minSelect: v ? Math.max(1, active.minSelect) : 0 })
                        }
                      />
                    </div>
                  </div>
                  {active.minSelect > active.maxSelect && (
                    <Callout tone="danger" role="alert" className="mt-3" title="Rule is impossible">
                      The minimum is higher than the maximum, so no customer could ever satisfy this
                      group. Lower the minimum before saving.
                    </Callout>
                  )}
                </div>

                <Divider />

                {/* -------- Values -------- */}
                <div>
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                    <SubHeading note="Price deltas are added to the dish price. Sold-out values are hidden at that branch only.">
                      Option values
                    </SubHeading>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconStart="plus"
                      onClick={() => setNewValueOpen(true)}
                    >
                      Add value
                    </Button>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {active.values.map((v) => (
                      <li key={v.id} className="rounded-[12px] border border-line p-3">
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                          <TextField
                            label="Value name"
                            value={v.name}
                            onChange={(e) => patchValue(v.id, { name: e.target.value })}
                          />
                          <MoneyField
                            label="Price delta"
                            sen={v.priceDelta}
                            hint="Use 0.00 for no extra charge."
                            onChange={(sen) => patchValue(v.id, { priceDelta: sen })}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
                          <p className="text-[12px] font-bold uppercase tracking-wide text-grey">
                            Availability
                          </p>
                          {BRANCHES.map((b) => {
                            const soldOut = v.soldOutAt.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-[13px] text-ink"
                              >
                                <input
                                  type="checkbox"
                                  checked={!soldOut}
                                  onChange={(e) =>
                                    patchValue(v.id, {
                                      soldOutAt: e.target.checked
                                        ? v.soldOutAt.filter((x) => x !== b.id)
                                        : [...v.soldOutAt, b.id],
                                    })
                                  }
                                  className="size-4.5 accent-[var(--color-cta)]"
                                />
                                {b.shortName}
                                {soldOut && (
                                  <Badge tone="danger" icon="cross" soft>
                                    Sold out
                                  </Badge>
                                )}
                              </label>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              patchActive({ values: active.values.filter((x) => x.id !== v.id) });
                              announce(`${v.name} removed from ${active.name}.`);
                            }}
                            className="ml-auto inline-flex min-h-9 items-center gap-1.5 text-[13px] font-semibold text-cta underline underline-offset-2"
                          >
                            <Icon name="trash" size={14} />
                            Remove {v.name}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* -------- Attached dishes -------- */}
            <section
              aria-labelledby="attached-title"
              className="rounded-[14px] border border-line bg-white p-4"
            >
              <h2 id="attached-title" className="text-[15px]">
                Attached to {active.attached.length}{" "}
                {active.attached.length === 1 ? "dish" : "dishes"}
              </h2>
              {attachedDishes.length === 0 ? (
                <p className="mt-2 text-[13px] text-grey">
                  No dish uses this group yet, so removing it is safe.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {attachedDishes.map((p) => (
                    <li key={p!.id}>
                      <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[13px] text-ink">
                        {p!.name}
                        <span className="num text-[12px] text-grey">{money(p!.price)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ---------------- Add value dialog ---------------- */}
      {newValueOpen && (
        <NewValueDialog
          groupName={active.name}
          onClose={() => setNewValueOpen(false)}
          onAdd={(name, priceDelta) => {
            patchActive({
              values: [
                ...active.values,
                { id: `v-${Date.now()}`, name, priceDelta, soldOutAt: [] },
              ],
            });
            announce(`${name} added to ${active.name}.`);
            setNewValueOpen(false);
          }}
        />
      )}

      {/* ---------------- Conflict warning ---------------- */}
      <Dialog
        open={conflict !== null}
        onClose={() => setConflict(null)}
        title="This group is still in use"
        tone="danger"
        size="md"
        description={
          conflict
            ? `${conflict.name} is attached to ${conflict.attached.length} ${
                conflict.attached.length === 1 ? "dish" : "dishes"
              }. Removing it changes what those customers can order.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConflict(null)}>
              Keep group
            </Button>
            <Button variant="primary" onClick={() => conflict && remove(conflict)}>
              Remove anyway
            </Button>
          </>
        }
      >
        <Callout tone="danger" role="alert" title="What happens if you remove it">
          <ul className="list-disc pl-4">
            <li>The question disappears from every dish below.</li>
            <li>
              {conflict?.required
                ? "Because the group is required, those dishes lose a mandatory answer — check that the kitchen ticket still makes sense."
                : "Existing carts keep the choice they already made until checkout revalidates them."}
            </li>
            <li>Past orders keep the option they recorded, so receipts stay accurate.</li>
          </ul>
        </Callout>
        {conflict && (
          <ul className="mt-4 flex flex-col gap-1.5">
            {conflict.attached.map((id) => {
              const p = PRODUCTS.find((x) => x.id === id);
              if (!p) return null;
              return (
                <li
                  key={id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-[13px] last:border-0"
                >
                  <span className="text-ink">{p.name}</span>
                  <span className="num text-grey">{money(p.price)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove(removing)}
        title={`Remove ${removing?.name ?? "this group"}?`}
        body="No dish uses this group, so nothing on the customer menu changes."
        confirmLabel="Remove group"
        cancelLabel="Keep group"
        destructive
      />
    </AdminShell>
  );
}

function NewValueDialog({
  groupName,
  onClose,
  onAdd,
}: {
  groupName: string;
  onClose: () => void;
  onAdd: (name: string, priceDelta: number) => void;
}) {
  const [name, setName] = useState("");
  const [delta, setDelta] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const error = name.trim().length === 0 ? "Give the value a name customers will understand." : undefined;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Add a value to ${groupName}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="dark"
            onClick={() => {
              setAttempted(true);
              if (error) return;
              onAdd(name.trim(), delta);
            }}
          >
            Add value
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Value name"
          required
          value={name}
          error={attempted ? error : undefined}
          onChange={(e) => setName(e.target.value)}
        />
        <MoneyField
          label="Price delta"
          sen={delta}
          hint="Added to the dish price when the customer picks this value."
          onChange={setDelta}
        />
      </div>
    </Dialog>
  );
}
