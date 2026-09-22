"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, PROMOTIONS, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Badge, Callout, Panel, PromoBadge } from "@/components/ui/primitives";
import { Chip } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import { SearchField } from "./search-field";
import {
  DEFAULT_FILTERS,
  SearchFilters,
  activeFilterCount,
  matchesSpiceFilter,
  type SearchFilterState,
  type SortKey,
} from "./search-filters";
import {
  SearchResultsGrid,
  SearchResultsSkeleton,
  SearchZeroState,
} from "./search-results";
import {
  matchesTerms,
  nearestProducts,
  queryTerms,
  relevance,
  spellingSuggestion,
} from "./search-matching";

/** Prototype only — a real build would read these from the device. */
const SEEDED_RECENT = ["yangnyeom", "cheese tteokbokki", "sets under rm20", "photo booth"];

const POPULAR_SEARCHES = [
  "Boneless chicken",
  "Soy garlic",
  "Kimchi",
  "Corn dog",
  "Strawberry milk",
  "Kimbap",
];

/** How long the simulated re-query takes. There is no server to wait for. */
const QUERY_MS = 320;

function sortProducts(products: Product[], sort: SortKey, terms: string[]): Product[] {
  const list = [...products];
  if (sort === "price-asc") return list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return list.sort((a, b) => b.price - a.price);
  if (sort === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "popular") {
    return list.sort(
      (a, b) => Number(b.popular) - Number(a.popular) || relevance(b, terms) - relevance(a, terms),
    );
  }
  return list.sort(
    (a, b) => relevance(b, terms) - relevance(a, terms) || a.name.localeCompare(b.name),
  );
}

export function SearchScreen({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const { branchId, sim } = useStore();
  const branch = branchById(branchId);

  const [term, setTerm] = useState(initialQuery);
  const [applied, setApplied] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [recent, setRecent] = useState<string[]>(SEEDED_RECENT);

  /* ---- a shared /search?q=… link wins over whatever is typed ---- */
  useEffect(() => setTerm(initialQuery), [initialQuery]);

  /* ---- simulated re-query, so the skeleton has something to cover ---- */
  useEffect(() => {
    if (term === applied) return;
    setLoading(true);
    const timer = window.setTimeout(() => {
      setApplied(term);
      setLoading(false);
    }, QUERY_MS);
    return () => window.clearTimeout(timer);
  }, [term, applied]);

  const terms = useMemo(() => queryTerms(applied), [applied]);
  const trimmed = applied.trim();

  const results = useMemo(() => {
    const matched = PRODUCTS.filter(
      (product) =>
        matchesTerms(product, terms) &&
        (filters.categoryId === "all" || product.categoryId === filters.categoryId) &&
        matchesSpiceFilter(product, filters.spice) &&
        (!filters.halalOnly || product.muslimFriendly) &&
        (!filters.availableOnly ||
          (product.availability[branchId] ?? "available") !== "sold_out"),
    );
    return sortProducts(matched, filters.sort, terms);
  }, [terms, filters, branchId]);

  const matchingCategories = useMemo(
    () =>
      terms.length === 0
        ? []
        : CATEGORIES.filter((category) =>
            terms.some((t) =>
              `${category.name} ${category.blurb} ${category.slug}`.toLowerCase().includes(t),
            ),
          ),
    [terms],
  );

  const matchingPromotions = useMemo(
    () =>
      terms.length === 0
        ? []
        : PROMOTIONS.filter((promotion) =>
            terms.some((t) =>
              `${promotion.name} ${promotion.code ?? ""} ${promotion.badge} ${promotion.description}`
                .toLowerCase()
                .includes(t),
            ),
          ),
    [terms],
  );

  const filtersActive = activeFilterCount(filters) > 0;
  const suggestion = useMemo(() => spellingSuggestion(trimmed), [trimmed]);
  const nearest = useMemo(() => nearestProducts(trimmed), [trimmed]);

  const runSearch = (value: string) => {
    setTerm(value);
    const next = value.trim();
    if (next) {
      setRecent((prev) => [next, ...prev.filter((r) => r !== next)].slice(0, 6));
      router.replace(`/search?q=${encodeURIComponent(next)}`, { scroll: false });
    } else {
      router.replace("/search", { scroll: false });
    }
  };

  const countLine = loading
    ? "Searching the menu…"
    : `${results.length} result${results.length === 1 ? "" : "s"}${
        trimmed ? ` for “${trimmed}”` : ` at ${branch.shortName}`
      }`;

  return (
    <div className="container-page py-8 lg:py-12">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-deep">Find it fast</p>
      <h1 className="mt-2 text-[clamp(32px,4.6vw,56px)] leading-[1.02]">SEARCH THE MENU</h1>
      <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-grey">
        One search across every dish, sauce, set and side. Prices and stock below are the ones set
        for {branch.name}.
      </p>

      <div className="mt-6">
        <SearchField
          value={term}
          onChange={setTerm}
          onSubmit={() => runSearch(term)}
          onClear={() => runSearch("")}
        />
      </div>

      <p className="num mt-3 text-[14px] font-semibold text-ink" aria-live="polite">
        {countLine}
      </p>

      {sim.offline && (
        <div className="mt-4 max-w-2xl">
          <Callout tone="warning" icon="wifiOff" title="You’re offline">
            These results come from the last menu we saved for {branch.shortName}. Adding dishes is
            paused until you reconnect.
          </Callout>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Nothing typed yet — recent and popular searches               */}
      {/* ------------------------------------------------------------ */}
      {trimmed.length === 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Panel as="section" aria-labelledby="recent-title" className="p-4">
            <h2 id="recent-title" className="flex items-center gap-2 text-[16px]">
              <Icon name="clock" size={16} />
              Recent searches
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {recent.map((entry) => (
                <li key={entry}>
                  <Chip onClick={() => runSearch(entry)}>{entry}</Chip>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-snug text-grey">
              Kept on this device for this session only — the prototype stores nothing on a server.
            </p>
          </Panel>

          <Panel as="section" aria-labelledby="popular-title" className="p-4">
            <h2 id="popular-title" className="flex items-center gap-2 text-[16px]">
              <Icon name="star" size={16} />
              Popular searches
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((entry) => (
                <li key={entry}>
                  <Chip onClick={() => runSearch(entry)}>{entry}</Chip>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] leading-snug text-grey">
              What people looked for across both branches in the last seven days.
            </p>
          </Panel>
        </div>
      )}

      <div className="mt-8">
        <SearchFilters
          filters={filters}
          branchShortName={branch.shortName}
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          onClear={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Categories and promotions that match the same words           */}
      {/* ------------------------------------------------------------ */}
      {!loading && matchingCategories.length > 0 && (
        <section aria-labelledby="matching-categories-title" className="mt-8">
          <h2 id="matching-categories-title" className="text-[18px]">
            Matching categories
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchingCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/menu?category=${category.slug}`}
                  className="flex h-full items-center gap-3 rounded-[14px] border border-line bg-white p-3.5 transition-colors hover:border-ink/35"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                    <Icon name="grid" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">
                      {category.name}
                    </span>
                    <span className="block text-[13px] leading-snug text-grey">
                      {category.blurb}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && matchingPromotions.length > 0 && (
        <section aria-labelledby="matching-promotions-title" className="mt-8">
          <h2 id="matching-promotions-title" className="text-[18px]">
            Matching promotions
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {matchingPromotions.map((promotion) => (
              <li key={promotion.id}>
                <Panel className="flex h-full flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <PromoBadge>{promotion.badge}</PromoBadge>
                    {promotion.code && (
                      <Badge tone="neutral" soft icon="tag">
                        <span className="num">{promotion.code}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-[15px] font-semibold text-ink">{promotion.name}</p>
                  <p className="text-[13px] leading-snug text-grey">{promotion.description}</p>
                  <p className="num mt-auto text-[12px] text-grey">
                    Minimum spend {money(promotion.minSpend)} ·{" "}
                    {promotion.branchIds.map((id) => branchById(id).shortName).join(" and ")}
                  </p>
                  <Link
                    href="/promotions"
                    className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-deep underline underline-offset-4"
                  >
                    Read the terms
                    <Icon name="chevronRight" size={14} />
                  </Link>
                </Panel>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Dish results                                                  */}
      {/* ------------------------------------------------------------ */}
      <section aria-labelledby="results-title" className="mt-8">
        <h2 id="results-title" className="sr-only">
          Dishes
        </h2>

        {loading ? (
          <SearchResultsSkeleton />
        ) : results.length === 0 ? (
          <SearchZeroState
            query={trimmed}
            suggestion={suggestion}
            nearest={nearest}
            filtersActive={filtersActive}
            onUseSuggestion={(value) => runSearch(value)}
            onClearFilters={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}
          />
        ) : (
          <SearchResultsGrid products={results} terms={terms} />
        )}
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-white p-4">
        <Badge tone="info" icon="shield" soft>
          Muslim-friendly kitchen
        </Badge>
        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-grey">
          Still not finding it? The team at{" "}
          <Link href="/locations" className="font-semibold text-deep underline underline-offset-2">
            either branch
          </Link>{" "}
          can tell you what is coming out of the fryer today.
        </p>
      </div>
    </div>
  );
}
