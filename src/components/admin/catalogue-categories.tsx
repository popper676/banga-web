"use client";

/** /admin/categories — ordered category list with reordering and a hero slot. */

import { useState } from "react";
import { money } from "@/lib/format";
import { PRODUCTS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/shell";
import { ConfirmDialog, Dialog } from "@/components/ui/overlays";
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  ErrorState,
} from "@/components/ui/primitives";
import { TextAreaField, TextField, Toggle } from "@/components/ui/forms";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  CardSkeleton,
  ResultCount,
  StateSwitch,
  errorRef,
  useAnnounce,
  useScreenState,
} from "./config-shared";
import { CATEGORY_ROWS, type CategoryRow } from "./catalogue-data";

const BLANK: CategoryRow = {
  id: "",
  name: "",
  slug: "",
  blurb: "",
  order: 0,
  visible: true,
  heroImage: "/images/categories/new-category.jpg",
  itemCount: 0,
};

export function CategoriesScreen() {
  const { pushToast } = useStore();
  const { state, setState } = useScreenState();
  const [live, announce] = useAnnounce();
  const [rows, setRows] = useState<CategoryRow[]>(CATEGORY_ROWS);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    setRows((prev) => {
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next.map((r, i) => ({ ...r, order: i + 1 }));
    });
    announce(
      `${rows[index].name} moved to position ${target + 1} of ${rows.length} in the menu order.`,
    );
  };

  const toggleVisible = (row: CategoryRow) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)));
    announce(`${row.name} ${row.visible ? "hidden from" : "shown on"} the customer menu.`);
    pushToast({
      tone: row.visible ? "warning" : "success",
      title: row.visible ? `${row.name} hidden` : `${row.name} visible`,
      body: row.visible
        ? "The section and its dishes disappear from the customer menu immediately."
        : "The section is back on the customer menu in its saved position.",
    });
  };

  const saveCategory = (draft: CategoryRow) => {
    const isNew = draft.id === "";
    const id = isNew ? `cat-${Date.now()}` : draft.id;
    setRows((prev) =>
      isNew
        ? [...prev, { ...draft, id, order: prev.length + 1 }]
        : prev.map((r) => (r.id === id ? { ...draft, id } : r)),
    );
    setEditing(null);
    announce(`${draft.name} saved.`);
    pushToast({
      tone: "success",
      title: isNew ? `${draft.name} added` : `${draft.name} updated`,
      body: isNew
        ? "It sits at the bottom of the menu until you reorder it."
        : "The customer menu is updated.",
    });
  };

  const removeCategory = () => {
    if (!deleting) return;
    setRows((prev) => prev.filter((r) => r.id !== deleting.id).map((r, i) => ({ ...r, order: i + 1 })));
    announce(`${deleting.name} deleted.`);
    pushToast({
      tone: "warning",
      title: `${deleting.name} deleted`,
      body:
        deleting.itemCount > 0
          ? `${deleting.itemCount} dishes are now uncategorised and hidden from the menu.`
          : "The empty section has been removed.",
    });
    setDeleting(null);
  };

  return (
    <AdminShell
      title="Categories"
      description="The order of this list is the order customers scroll through on the menu page."
      actions={
        <>
          <StateSwitch state={state} onChange={setState} />
          <Button size="sm" variant="primary" iconStart="plus" onClick={() => setEditing(BLANK)}>
            New category
          </Button>
        </>
      }
    >
      {live}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {state === "loading" && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <CardSkeleton key={i} lines={2} />
              ))}
            </div>
          )}

          {state === "error" && (
            <ErrorState
              title="Categories could not be loaded"
              body="Nothing was changed. The order you see on the customer menu is unaffected."
              requestId={errorRef("CAT")}
              onRetry={() => setState("ready")}
            />
          )}

          {state === "empty" && (
            <EmptyState
              icon="list"
              title="No categories yet"
              body="Create a category before adding dishes — every dish must belong to one."
              action={
                <Button variant="primary" iconStart="plus" onClick={() => setEditing(BLANK)}>
                  Create the first category
                </Button>
              }
            />
          )}

          {state === "ready" && (
            <>
              <ResultCount>
                {rows.length} categories · {rows.filter((r) => r.visible).length} visible to
                customers
              </ResultCount>

              <ol className="flex flex-col gap-3">
                {rows.map((row, index) => (
                  <li key={row.id}>
                    <article className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-white p-3">
                      <div
                        className="flex shrink-0 flex-col gap-1"
                        role="group"
                        aria-label={`Reorder ${row.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${row.name} up to position ${index}`}
                          className="flex size-8 items-center justify-center rounded-[8px] border border-line text-ink hover:bg-mint disabled:opacity-35"
                        >
                          <Icon name="chevronDown" size={15} className="rotate-180" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === rows.length - 1}
                          aria-label={`Move ${row.name} down to position ${index + 2}`}
                          className="flex size-8 items-center justify-center rounded-[8px] border border-line text-ink hover:bg-mint disabled:opacity-35"
                        >
                          <Icon name="chevronDown" size={15} />
                        </button>
                      </div>

                      <span className="num flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">
                        {index + 1}
                      </span>

                      <FoodImage
                        src={row.heroImage}
                        alt={`${row.name} section header image`}
                        variant="scene"
                        className="h-14 w-20 shrink-0"
                        rounded="rounded-[10px]"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[15px]">{row.name}</h2>
                          {!row.visible && (
                            <Badge tone="warning" icon="eye" soft>
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-[13px] text-grey">{row.blurb}</p>
                        <p className="num mt-0.5 text-[12px] text-grey">
                          {row.itemCount} {row.itemCount === 1 ? "dish" : "dishes"} · /menu#
                          {row.slug}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <div className="w-44">
                          <Toggle
                            label="Visible"
                            description={row.visible ? "On the menu" : "Hidden from customers"}
                            checked={row.visible}
                            onChange={() => toggleVisible(row)}
                          />
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          iconStart="trash"
                          onClick={() => setDeleting(row)}
                        >
                          <span className="sr-only">Delete {row.name}</span>
                        </Button>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Callout tone="info" icon="list" title="Order controls the menu page">
            Customers see these sections top to bottom in exactly this order, and the category rail
            on <span className="font-semibold">/menu</span> uses the same sequence. Put the sections
            that sell first.
          </Callout>
          <Callout tone="warning" icon="alert" title="Hiding is not deleting">
            A hidden category keeps its dishes, prices and sales history. Deleting one leaves its
            dishes without a section, so they drop off the menu until you move them.
          </Callout>
          <section
            aria-labelledby="cat-stats"
            className="rounded-[14px] border border-line bg-white p-4"
          >
            <h2 id="cat-stats" className="text-[15px]">
              Menu at a glance
            </h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between gap-3">
                <dt className="text-[13px] text-grey">Dishes on the menu</dt>
                <dd className="num text-[13px] font-semibold text-ink">{PRODUCTS.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[13px] text-grey">Cheapest item</dt>
                <dd className="num text-[13px] font-semibold text-ink">
                  {money(Math.min(...PRODUCTS.map((p) => p.price)))}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[13px] text-grey">Largest section</dt>
                <dd className="text-[13px] font-semibold text-ink">
                  {[...rows].sort((a, b) => b.itemCount - a.itemCount)[0]?.name ?? "—"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      {editing && (
        <CategoryDialog
          key={editing.id || "new"}
          row={editing}
          onClose={() => setEditing(null)}
          onSave={saveCategory}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={removeCategory}
        title={`Delete ${deleting?.name ?? "this category"}?`}
        body={
          deleting && deleting.itemCount > 0
            ? `${deleting.itemCount} dishes sit in this section. They will be left without a category and hidden from the customer menu until you move them. Hiding the section instead keeps everything intact.`
            : "This empty section will be removed from the customer menu. You can create it again later."
        }
        confirmLabel="Delete category"
        cancelLabel="Keep category"
        destructive
      />
    </AdminShell>
  );
}

function CategoryDialog({
  row,
  onClose,
  onSave,
}: {
  row: CategoryRow;
  onClose: () => void;
  onSave: (row: CategoryRow) => void;
}) {
  const [name, setName] = useState(row.name);
  const [blurb, setBlurb] = useState(row.blurb);
  const [visible, setVisible] = useState(row.visible);
  const [attempted, setAttempted] = useState(false);

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const nameError = name.trim().length < 3 ? "Use at least three characters." : undefined;

  return (
    <Dialog
      open
      onClose={onClose}
      title={row.id ? `Edit ${row.name}` : "New category"}
      description="Names are shown to customers exactly as typed, in English."
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
              if (nameError) return;
              onSave({ ...row, name: name.trim(), blurb: blurb.trim(), visible, slug });
            }}
          >
            Save category
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Category name"
          required
          value={name}
          error={attempted ? nameError : undefined}
          hint={slug ? `Menu anchor: /menu#${slug}` : "The anchor link is generated from the name."}
          onChange={(e) => setName(e.target.value)}
        />
        <TextAreaField
          label="Short blurb"
          hint="One line under the section heading on the menu page."
          maxLength={80}
          showCount
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
        />
        <div className="rounded-[12px] border border-dashed border-line bg-cream/50 p-3">
          <p className="text-[13px] font-semibold text-ink">Hero image</p>
          <div className="mt-2 flex items-center gap-3">
            <FoodImage
              src={row.heroImage}
              alt={`${name || "New category"} section header image`}
              variant="scene"
              className="h-16 w-24 shrink-0"
              rounded="rounded-[10px]"
            />
            <div className="min-w-0">
              <p className="text-[12px] leading-relaxed text-grey">
                Landscape 16:9. Uploading is disabled in this prototype, so a designed placeholder
                is shown.
              </p>
              <Button size="sm" variant="secondary" disabled className="mt-2">
                Replace image (disabled)
              </Button>
            </div>
          </div>
        </div>
        <Toggle
          label="Visible on the customer menu"
          description="Hidden categories keep their dishes but disappear from /menu."
          checked={visible}
          onChange={setVisible}
        />
      </div>
    </Dialog>
  );
}
