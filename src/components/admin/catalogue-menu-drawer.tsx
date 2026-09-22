"use client";

/** Drawer editor for one dish: Details, Pricing, Media, Options, Availability. */

import { useState } from "react";
import Link from "next/link";
import { BRANCHES, CATEGORIES, OPTION_GROUPS } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { AVAILABILITY } from "@/lib/status";
import type { Availability, Product } from "@/lib/types";
import { ConfirmDialog, Drawer } from "@/components/ui/overlays";
import { Badge, Button, Callout, Divider } from "@/components/ui/primitives";
import { Chip, SelectField, Segmented, TextAreaField, TextField, Toggle } from "@/components/ui/forms";
import { FoodImage } from "@/components/ui/media";
import { Icon, type IconKey } from "@/components/ui/icons";
import {
  DirtyFlag,
  FieldGrid,
  MetaRow,
  MoneyField,
  SubHeading,
  TabPanel,
  Tabs,
  useDirtyGuard,
} from "./config-shared";
import {
  DEFAULT_STOCK_RULES,
  MENU_TAG_OPTIONS,
  PRICE_OVERRIDES,
  SPICE_LABELS,
  selectionRuleLabel,
} from "./catalogue-data";

export interface MenuOverlay {
  name?: string;
  categoryId?: string;
  price?: number;
  availability?: Record<string, Availability>;
  active?: boolean;
  spiceLevel?: Product["spiceLevel"];
  tags?: string[];
}

type TabKey = "details" | "pricing" | "media" | "options" | "availability";

const TABS: { value: TabKey; label: string; icon: IconKey }[] = [
  { value: "details", label: "Details", icon: "list" },
  { value: "pricing", label: "Pricing", icon: "tag" },
  { value: "media", label: "Media", icon: "camera" },
  { value: "options", label: "Options", icon: "filter" },
  { value: "availability", label: "Availability", icon: "bag" },
];

export function MenuEditorDrawer({
  product,
  overlay,
  onClose,
  onSave,
}: {
  product: Product;
  overlay?: MenuOverlay;
  onClose: () => void;
  onSave: (patch: MenuOverlay, message: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>("details");
  const [attempted, setAttempted] = useState(false);

  const [name, setName] = useState(overlay?.name ?? product.name);
  const [koreanName, setKoreanName] = useState(product.koreanName ?? "");
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState(overlay?.categoryId ?? product.categoryId);
  const [spiceLevel, setSpiceLevel] = useState<Product["spiceLevel"]>(
    overlay?.spiceLevel ?? product.spiceLevel,
  );
  const [tags, setTags] = useState<string[]>(overlay?.tags ?? product.tags);
  const [price, setPrice] = useState(overlay?.price ?? product.price);
  const [overrides, setOverrides] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      BRANCHES.map((b) => [b.id, PRICE_OVERRIDES[product.id]?.[b.id] ?? null]),
    ),
  );
  const [availability, setAvailability] = useState<Record<string, Availability>>(
    () => overlay?.availability ?? { ...product.availability },
  );
  const [optionGroupIds, setOptionGroupIds] = useState<string[]>(product.optionGroupIds);
  const [active, setActive] = useState(overlay?.active ?? true);

  const guard = useDirtyGuard(onClose);
  const touch = () => guard.setDirty(true);

  const errors = {
    name: name.trim().length === 0 ? "Enter the dish name customers will see on the menu." : undefined,
    price:
      price < 100
        ? "Price must be at least RM1.00. Use a promotion if you want to discount a dish."
        : undefined,
    description:
      description.trim().length > 0 && description.trim().length < 12
        ? "Write at least a short sentence — this line appears under the dish name."
        : undefined,
  };
  const errorList = Object.entries(errors).filter(([, v]) => v) as [string, string][];
  const hasErrors = errorList.length > 0;

  const save = () => {
    setAttempted(true);
    if (hasErrors) {
      setTab(errors.price && !errors.name ? "pricing" : "details");
      return;
    }
    guard.saved();
    onSave(
      { name: name.trim(), categoryId, price, availability, active, spiceLevel, tags },
      `${name.trim()} saved.`,
    );
  };

  const showValidationExample = () => {
    setName("");
    setPrice(0);
    setAttempted(true);
    setTab("details");
    touch();
  };

  return (
    <>
      <Drawer
        open
        onClose={guard.attemptClose}
        width={620}
        title={overlay?.name ?? product.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="num">{product.id}</span>
            <span aria-hidden>·</span>
            <span>{CATEGORIES.find((c) => c.id === categoryId)?.name}</span>
          </span>
        }
        footer={
          <div className="flex w-full flex-wrap items-center gap-2">
            <DirtyFlag dirty={guard.dirty} />
            <button
              type="button"
              onClick={showValidationExample}
              className="text-[12px] font-semibold text-grey underline underline-offset-2 hover:text-ink"
            >
              Show validation error
            </button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="ghost" onClick={guard.attemptClose}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={save} iconStart="check">
                Save dish
              </Button>
            </div>
          </div>
        }
      >
        {attempted && hasErrors && (
          <Callout
            tone="danger"
            role="alert"
            title={`Fix ${errorList.length} ${errorList.length === 1 ? "problem" : "problems"} before saving`}
            className="mb-4"
          >
            <ul className="list-disc pl-4">
              {errorList.map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </Callout>
        )}

        <Tabs idBase="dish" label="Dish editor sections" tabs={TABS} value={tab} onChange={setTab} />

        {/* ---------------- Details ---------------- */}
        <TabPanel idBase="dish" value="details" active={tab === "details"}>
          <div className="flex flex-col gap-4">
            <TextField
              label="Dish name"
              required
              value={name}
              error={attempted ? errors.name : undefined}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
            />
            <FieldGrid>
              <TextField
                label="Korean name"
                hint="Optional. Shown as a secondary line on the menu."
                value={koreanName}
                onChange={(e) => {
                  setKoreanName(e.target.value);
                  touch();
                }}
              />
              <SelectField
                label="Category"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  touch();
                }}
                options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
              />
            </FieldGrid>
            <TextAreaField
              label="Short description"
              hint="One line, plain English. This is the text under the dish name."
              maxLength={140}
              showCount
              value={description}
              error={attempted ? errors.description : undefined}
              onChange={(e) => {
                setDescription(e.target.value);
                touch();
              }}
            />

            <div>
              <SubHeading note="Spice level drives the chilli indicator and the spice filter on the customer menu.">
                Spice level
              </SubHeading>
              <Segmented<string>
                label="Spice level"
                size="sm"
                value={String(spiceLevel)}
                onChange={(v) => {
                  setSpiceLevel(Number(v) as Product["spiceLevel"]);
                  touch();
                }}
                options={SPICE_LABELS.map((label, i) => ({ value: String(i), label }))}
              />
            </div>

            <div>
              <SubHeading note="Tags appear as small labels on the dish card.">Tags</SubHeading>
              <div className="flex flex-wrap gap-2">
                {MENU_TAG_OPTIONS.map((t) => (
                  <Chip
                    key={t}
                    active={tags.includes(t)}
                    onClick={() => {
                      setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
                      touch();
                    }}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>

            <Divider />
            <Toggle
              label="Published on the customer menu"
              description="Unpublishing hides the dish everywhere without deleting it or its sales history."
              checked={active}
              onChange={(v) => {
                setActive(v);
                touch();
              }}
            />
            <dl>
              <MetaRow label="Allergens">{product.allergens.join(", ") || "None recorded"}</MetaRow>
              <MetaRow label="Halal framing">
                Muslim-friendly kitchen · no alcohol, no pork, no mirin
              </MetaRow>
              <MetaRow label="Energy">
                <span className="num">{product.kcal} kcal</span>
              </MetaRow>
            </dl>
          </div>
        </TabPanel>

        {/* ---------------- Pricing ---------------- */}
        <TabPanel idBase="dish" value="pricing" active={tab === "pricing"}>
          <div className="flex flex-col gap-4">
            <MoneyField
              label="Base price"
              required
              sen={price}
              error={attempted ? errors.price : undefined}
              hint="Applies at every branch unless a branch override is set below. SST is added at checkout."
              onChange={(v) => {
                setPrice(v);
                touch();
              }}
            />
            <Divider />
            <SubHeading note="Use overrides sparingly — campus pricing is the usual reason.">
              Per-branch override
            </SubHeading>
            <div className="flex flex-col gap-3">
              {BRANCHES.map((b) => {
                const on = overrides[b.id] !== null;
                return (
                  <div key={b.id} className="rounded-[12px] border border-line p-3">
                    <Toggle
                      label={`Override at ${b.shortName}`}
                      description={
                        on
                          ? "Customers at this branch see the override price."
                          : `Currently uses the base price of ${money(price)}.`
                      }
                      checked={on}
                      onChange={(v) => {
                        setOverrides((prev) => ({ ...prev, [b.id]: v ? price : null }));
                        touch();
                      }}
                    />
                    {on && (
                      <div className="mt-2 max-w-52">
                        <MoneyField
                          label={`${b.shortName} price`}
                          sen={overrides[b.id] ?? price}
                          onChange={(v) => {
                            setOverrides((prev) => ({ ...prev, [b.id]: v }));
                            touch();
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Callout tone="info" icon="shield" title="Price changes are logged">
              Every price edit is written to the audit log with the before and after value, the
              branch scope and who made the change.
            </Callout>
          </div>
        </TabPanel>

        {/* ---------------- Media ---------------- */}
        <TabPanel idBase="dish" value="media" active={tab === "media"}>
          <div className="flex flex-col gap-4">
            <FoodImage
              src={product.image}
              alt={`${name || product.name} — current menu photograph`}
              className="aspect-[4/3] w-full"
            />
            <p className="text-[12px] text-grey">
              No brand photography exists yet, so a designed placeholder is shown. The real file
              will live at <span className="num">{product.image}</span>.
            </p>
            <div
              role="group"
              aria-label="Upload a dish photograph"
              className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-line bg-cream/50 p-6 text-center"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-mint text-deep">
                <Icon name="camera" size={20} />
              </span>
              <p className="text-[14px] font-semibold text-ink">Drop a JPEG or PNG here</p>
              <p className="max-w-[40ch] text-[12px] leading-relaxed text-grey">
                Landscape 4:3, at least 1200px wide, under 2MB. Uploading is disabled in this
                prototype — there is no file storage behind this screen.
              </p>
              <Button size="sm" variant="secondary" disabled iconStart="download">
                Choose file (disabled)
              </Button>
            </div>
          </div>
        </TabPanel>

        {/* ---------------- Options ---------------- */}
        <TabPanel idBase="dish" value="options" active={tab === "options"}>
          <div className="flex flex-col gap-3">
            <p className="text-[13px] leading-relaxed text-grey">
              Option groups are shared across dishes. Edit the values and price deltas in{" "}
              <Link
                href="/admin/options"
                className="font-semibold text-deep underline underline-offset-2"
              >
                Options &amp; add-ons
              </Link>
              .
            </p>
            {OPTION_GROUPS.map((g) => {
              const on = optionGroupIds.includes(g.id);
              return (
                <label
                  key={g.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[12px] border p-3",
                    on ? "border-ink bg-mint" : "border-line bg-white hover:border-ink/35",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => {
                      setOptionGroupIds((prev) =>
                        prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id],
                      );
                      touch();
                    }}
                    className="mt-0.5 size-4.5 accent-[var(--color-cta)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{g.name}</span>
                    <span className="block text-[12px] text-grey">
                      {selectionRuleLabel(g)} · {g.choices.length} values
                    </span>
                  </span>
                  {g.required && (
                    <Badge tone="warning" icon="alert" soft>
                      Required
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>
        </TabPanel>

        {/* ---------------- Availability ---------------- */}
        <TabPanel idBase="dish" value="availability" active={tab === "availability"}>
          <div className="flex flex-col gap-4">
            <SubHeading note="Availability is per branch. The customer menu greys the dish out and blocks it from the cart.">
              Stock state per branch
            </SubHeading>
            {BRANCHES.map((b) => (
              <div key={b.id} className="rounded-[12px] border border-line p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink">{b.name}</p>
                  <Badge
                    tone={AVAILABILITY[availability[b.id]].tone}
                    icon={AVAILABILITY[availability[b.id]].icon}
                    soft
                  >
                    {AVAILABILITY[availability[b.id]].label}
                  </Badge>
                </div>
                <Segmented<Availability>
                  label={`Availability at ${b.shortName}`}
                  size="sm"
                  full
                  value={availability[b.id]}
                  onChange={(v) => {
                    setAvailability((prev) => ({ ...prev, [b.id]: v }));
                    touch();
                  }}
                  options={[
                    { value: "available", label: "Available" },
                    { value: "low", label: "Low stock" },
                    { value: "sold_out", label: "Sold out" },
                  ]}
                />
              </div>
            ))}
            <Callout tone="warning" icon="clock" title="Sold out resets every morning">
              Anything marked sold out today returns to available at{" "}
              <span className="num">{DEFAULT_STOCK_RULES.dailyResetTime}</span> tomorrow. Change the
              reset time in Branch inventory.
            </Callout>
          </div>
        </TabPanel>
      </Drawer>

      <ConfirmDialog
        open={guard.asking}
        onClose={() => guard.setAsking(false)}
        onConfirm={guard.discard}
        title="Discard your changes?"
        body="This dish has edits that have not been saved. Closing the editor now will lose them."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
      />
    </>
  );
}
