"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Badge, ButtonLink, EmptyState, Panel } from "@/components/ui/primitives";
import { Chip, Toggle } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "@/components/site/product-card";
import { BranchBanner } from "./menu-branch-banner";
import {
  PRICE_BANDS,
  SPICE_OPTIONS,
  availabilityAt,
  inPriceBand,
  matchesQuery,
  matchesSpice,
  useMediaQuery,
  type PriceBand,
  type SpiceFilter,
} from "./menu-filters";

/** Prototype-only — a real build would read these from the device. */
const RECENT_SEARCHES = ["yangnyeom", "cheese tteokbokki", "sets under rm20", "photo booth"];

const POPULAR_SEARCHES = [
  "Boneless chicken",
  "Soy garlic",
  "Corn dog",
  "Strawberry milk",
  "Kimbap",
  "Free refill",
];

export function MenuSearch({
  initialQuery,
  initialCategory,
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const { branchId, sim } = useStore();
  const isNarrow = useMediaQuery("(max-width: 639px)");

  const [query, setQuery] = useState(initialQuery ?? "");
  const [categoryId, setCategoryId] = useState(
    () => CATEGORIES.find((c) => c.slug === initialCategory)?.id ?? "all",
  );
  const [priceBand, setPriceBand] = useState<PriceBand>("any");
  const [spice, setSpice] = useState<SpiceFilter>("any");
  const [muslimFriendly, setMuslimFriendly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const branchShortName = branchId === "taylors" ? "Taylor’s Lakeside" : "SS15";

  const results: Product[] = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          matchesQuery(p, query) &&
          (categoryId === "all" || p.categoryId === categoryId) &&
          inPriceBand(p.price, priceBand) &&
          matchesSpice(p, spice) &&
          (!muslimFriendly || p.muslimFriendly) &&
          (!availableOnly || availabilityAt(p, branchId) !== "sold_out"),
      ),
    [query, categoryId, priceBand, spice, muslimFriendly, availableOnly, branchId],
  );

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(query.trim()
      ? [{ key: "q", label: `“${query.trim()}”`, clear: () => setQuery("") }]
      : []),
    ...(categoryId !== "all"
      ? [
          {
            key: "category",
            label: CATEGORIES.find((c) => c.id === categoryId)?.name ?? "Category",
            clear: () => setCategoryId("all"),
          },
        ]
      : []),
    ...(priceBand !== "any"
      ? [
          {
            key: "price",
            label: PRICE_BANDS.find((b) => b.value === priceBand)?.label ?? "Price",
            clear: () => setPriceBand("any"),
          },
        ]
      : []),
    ...(spice !== "any"
      ? [
          {
            key: "spice",
            label: `Spice: ${SPICE_OPTIONS.find((s) => s.value === spice)?.label}`,
            clear: () => setSpice("any"),
          },
        ]
      : []),
    ...(muslimFriendly
      ? [{ key: "halal", label: "Muslim-friendly", clear: () => setMuslimFriendly(false) }]
      : []),
    ...(availableOnly
      ? [
          {
            key: "stock",
            label: `In stock at ${branchShortName}`,
            clear: () => setAvailableOnly(false),
          },
        ]
      : []),
  ];

  const clearAll = () => {
    setQuery("");
    setCategoryId("all");
    setPriceBand("any");
    setSpice("any");
    setMuslimFriendly(false);
    setAvailableOnly(false);
  };

  const suggestions = PRODUCTS.filter(
    (p) => p.popular && availabilityAt(p, branchId) !== "sold_out",
  ).slice(0, 3);

  return (
    <div className="container-page py-8 lg:py-12">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-deep">Find it fast</p>
      <h1 className="mt-2 text-[clamp(32px,4.5vw,52px)] leading-[1.03]">SEARCH THE MENU</h1>

      {/* Large search field */}
      <div className="mt-6 max-w-2xl">
        <label htmlFor="site-search" className="text-[13px] font-semibold text-ink">
          Search dishes, sauces and sets
        </label>
        <div className="relative mt-1.5">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-grey"
            aria-hidden
          >
            <Icon name="search" size={20} />
          </span>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “yangnyeom”, “under rm20” or “kimbap”"
            autoComplete="off"
            className="h-14 w-full rounded-[16px] border border-line bg-white pl-12 pr-4 text-[17px] text-ink placeholder:text-grey/70 focus:border-ink"
          />
        </div>
        <p className="mt-2 text-[13px] text-grey" aria-live="polite">
          {results.length} result{results.length === 1 ? "" : "s"} at {branchShortName}
        </p>
      </div>

      <div className="mt-6">
        <BranchBanner
          label="Searching stock for"
          note="Availability and prices follow the branch you are ordering from."
        />
      </div>

      {/* Recent + popular searches */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel className="p-4">
          <h2 className="flex items-center gap-2 text-[15px]">
            <Icon name="clock" size={15} />
            Recent searches
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {RECENT_SEARCHES.map((r) => (
              <li key={r}>
                <Chip onClick={() => setQuery(r)}>{r}</Chip>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-grey">
            Saved on this device only — this prototype stores nothing on a server.
          </p>
        </Panel>

        <Panel className="p-4">
          <h2 className="flex items-center gap-2 text-[15px]">
            <Icon name="star" size={15} />
            Popular right now
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((p) => (
              <li key={p}>
                <Chip onClick={() => setQuery(p)}>{p}</Chip>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-grey">
            Based on the last 7 days across both branches.
          </p>
        </Panel>
      </div>

      {/* Category chips */}
      <nav aria-label="Filter by category" className="mt-6">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          <li>
            <Chip active={categoryId === "all"} onClick={() => setCategoryId("all")}>
              Everything
            </Chip>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Chip active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                {c.name}
              </Chip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[262px_minmax(0,1fr)]">
        {/* -------------------------------------------------------- */}
        {/* Filters                                                   */}
        {/* -------------------------------------------------------- */}
        <Panel as="aside" className="p-5 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 text-[17px]">
            <Icon name="filter" size={16} />
            Filters
          </h2>

          <div className="mt-4">
            <p className="mb-2 text-[13px] font-semibold text-ink">Price</p>
            <div role="group" aria-label="Price range" className="flex flex-wrap gap-2">
              {PRICE_BANDS.map((b) => (
                <Chip
                  key={b.value}
                  active={priceBand === b.value}
                  onClick={() => setPriceBand(b.value)}
                >
                  {b.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[13px] font-semibold text-ink">Spice level</p>
            <div role="group" aria-label="Spice level" className="flex flex-wrap gap-2">
              {SPICE_OPTIONS.map((s) => (
                <Chip key={s.value} active={spice === s.value} onClick={() => setSpice(s.value)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-line pt-2">
            <Toggle
              checked={muslimFriendly}
              onChange={setMuslimFriendly}
              label="Muslim-friendly only"
              description="Our whole kitchen is Muslim-friendly — this keeps it explicit."
            />
            <Toggle
              checked={availableOnly}
              onChange={setAvailableOnly}
              label={`In stock at ${branchShortName}`}
              description="Hide anything sold out at your branch today."
            />
          </div>

          <ButtonLink href="/menu" variant="secondary" size="sm" full className="mt-4">
            Back to the full menu
          </ButtonLink>
        </Panel>

        {/* -------------------------------------------------------- */}
        {/* Results                                                   */}
        {/* -------------------------------------------------------- */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            <p className="num text-[14px] font-semibold text-ink">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.clear}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-ink bg-ink px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-deep"
              >
                {f.label}
                <Icon name="cross" size={13} />
                <span className="sr-only">Remove this filter</span>
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[13px] font-semibold text-cta underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>

          {sim.offline && (
            <p
              role="status"
              className="mt-3 flex items-center gap-2 rounded-[12px] border border-cta/30 bg-cta/8 px-3.5 py-2.5 text-[13px] font-medium text-ink"
            >
              <Icon name="wifiOff" size={15} />
              Offline — results come from the last saved menu and adding is paused.
            </p>
          )}

          {results.length === 0 ? (
            <div className="mt-5 flex flex-col gap-5">
              <EmptyState
                icon="search"
                title={query.trim() ? `No matches for “${query.trim()}”` : "No matches"}
                body="Check the spelling, try a shorter word, or drop one of the filters above."
                action={
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex h-11 items-center rounded-full border border-ink/20 bg-white px-5 text-[15px] font-semibold text-ink hover:bg-mint"
                  >
                    Clear all filters
                  </button>
                }
              />
              <section aria-labelledby="suggestions-title">
                <h2 id="suggestions-title" className="text-[18px]">
                  Try one of these instead
                </h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <fieldset
              disabled={sim.offline}
              className={cn(
                "mt-5 grid min-w-0 gap-4",
                isNarrow ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              <legend className="sr-only">Search results</legend>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} layout={isNarrow ? "row" : "grid"} />
              ))}
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-[14px] border border-line bg-white p-4">
            <Badge tone="info" icon="shield" soft>
              Muslim-friendly kitchen
            </Badge>
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-grey">
              Can&rsquo;t find something? The kitchen at{" "}
              <Link href="/locations" className="font-semibold text-deep underline underline-offset-2">
                either branch
              </Link>{" "}
              can tell you what is on today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
