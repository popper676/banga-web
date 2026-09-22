"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Product } from "@/lib/types";
import {
  ButtonLink,
  Callout,
  EmptyState,
  Panel,
  SkeletonCard,
} from "@/components/ui/primitives";
import { Chip, Segmented } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "@/components/site/product-card";
import { BranchBanner, BranchClosedCallout } from "./menu-branch-banner";
import {
  SPICE_OPTIONS,
  availabilityAt,
  matchesQuery,
  matchesSpice,
  useMediaQuery,
  type SpiceFilter,
} from "./menu-filters";

/** How long the simulated first-load takes. There is no server to wait for. */
const LOAD_MS = 700;

interface Section {
  category: Category;
  items: Product[];
}

export function MenuBrowser({
  initialCategory,
  initialQuery,
}: {
  initialCategory?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const { branchId, cartCount, totals, draft, patchDraft, sim } = useStore();

  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(initialQuery ?? "");
  const [muslimFriendly, setMuslimFriendly] = useState(false);
  const [underTwenty, setUnderTwenty] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);
  const [spice, setSpice] = useState<SpiceFilter>("any");
  const [activeCategory, setActiveCategory] = useState(() => {
    const match = CATEGORIES.find((c) => c.slug === initialCategory);
    return match?.id ?? CATEGORIES[0].id;
  });

  const isNarrow = useMediaQuery("(max-width: 639px)");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const query = initialQuery ?? "";

  /* ---- simulated first load ---- */
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const filtersActive = muslimFriendly || underTwenty || popularOnly || spice !== "any";
  const narrowed = filtersActive || query.length > 0;

  const sections: Section[] = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        items: PRODUCTS.filter(
          (p) =>
            p.categoryId === category.id &&
            matchesQuery(p, query) &&
            (!muslimFriendly || p.muslimFriendly) &&
            (!underTwenty || p.price < 2000) &&
            (!popularOnly || p.popular) &&
            matchesSpice(p, spice),
        ),
      })),
    [query, muslimFriendly, underTwenty, popularOnly, spice],
  );

  const visible = narrowed ? sections.filter((s) => s.items.length > 0) : sections;
  const resultCount = sections.reduce((n, s) => n + s.items.length, 0);
  const soldOutHere = sections
    .flatMap((s) => s.items)
    .filter((p) => availabilityAt(p, branchId) === "sold_out").length;

  const railKey = visible.map((s) => s.category.id).join(",");

  /* ---- scroll-spy ---- */
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = onscreen[0];
        if (first) setActiveCategory(first.target.id.replace("category-", ""));
      },
      { rootMargin: "-160px 0px -55% 0px", threshold: 0 },
    );
    for (const el of Object.values(sectionRefs.current)) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [loading, railKey]);

  /* ---- deep link: ?category=signature-chicken ---- */
  useEffect(() => {
    if (loading || !initialCategory) return;
    const match = CATEGORIES.find((c) => c.slug === initialCategory);
    const el = match ? sectionRefs.current[match.id] : null;
    el?.scrollIntoView({ behavior: sim.reducedMotion ? "auto" : "smooth", block: "start" });
  }, [loading, initialCategory, sim.reducedMotion]);

  const jumpTo = (categoryId: string) => {
    setActiveCategory(categoryId);
    sectionRefs.current[categoryId]?.scrollIntoView({
      behavior: sim.reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const clearFilters = () => {
    setMuslimFriendly(false);
    setUnderTwenty(false);
    setPopularOnly(false);
    setSpice("any");
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : "/search");
  };

  return (
    <div className="pb-4">
      {/* ---------------------------------------------------------- */}
      {/* Page head, branch context and filters                       */}
      {/* ---------------------------------------------------------- */}
      <div className="container-page pt-8 lg:pt-12">
        <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-deep">Order now</p>
        <h1 className="mt-2 text-[clamp(34px,5vw,60px)] leading-[1.02]">THE MENU</h1>
        <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-grey">
          Boneless Korean chicken, individual sets under RM20 and everything else we make. Prices
          and availability below are for the branch you are ordering from.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <BranchBanner note="Switch branch any time — your cart is checked against it." />
          <BranchClosedCallout />
          {sim.offline && (
            <Callout tone="danger" icon="wifiOff" title="You’re offline" role="alert">
              This is the last menu we saved for this branch. Adding items is turned off until you
              reconnect, but you can keep browsing.
            </Callout>
          )}
        </div>

        {/* Search + fulfilment */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <form onSubmit={submitSearch} role="search" className="w-full max-w-md">
            <label htmlFor="menu-search" className="text-[13px] font-semibold text-ink">
              Search the menu
            </label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative flex-1">
                <span
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-grey"
                  aria-hidden
                >
                  <Icon name="search" size={17} />
                </span>
                <input
                  id="menu-search"
                  type="search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Yangnyeom, tteokbokki, sets…"
                  className="h-12 w-full rounded-[12px] border border-line bg-white pl-10.5 pr-3.5 text-[16px] text-ink placeholder:text-grey/70 focus:border-ink"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[12px] border border-ink/20 bg-white px-4 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:bg-mint"
              >
                Search
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-[12px] text-grey">
              Opens{" "}
              <Link href="/search" className="font-semibold text-deep underline underline-offset-2">
                search and filters
              </Link>{" "}
              with price, spice and availability options.
            </p>
          </form>

          <div className="shrink-0">
            <Segmented
              label="How would you like your order"
              value={draft.fulfilment}
              onChange={(v) => patchDraft({ fulfilment: v })}
              options={[
                { value: "pickup", label: "Pickup", icon: "bag" },
                { value: "delivery", label: "Delivery", icon: "bike" },
              ]}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip active={muslimFriendly} icon="shield" onClick={() => setMuslimFriendly((v) => !v)}>
            Muslim-friendly
          </Chip>
          <Chip active={underTwenty} icon="tag" onClick={() => setUnderTwenty((v) => !v)}>
            Under RM20
          </Chip>
          <Chip active={popularOnly} icon="star" onClick={() => setPopularOnly((v) => !v)}>
            Popular
          </Chip>

          <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />

          <div role="group" aria-label="Spice level" className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-grey">
              Spice
            </span>
            {SPICE_OPTIONS.map((o) => (
              <Chip key={o.value} active={spice === o.value} onClick={() => setSpice(o.value)}>
                {o.label}
              </Chip>
            ))}
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 text-[13px] font-semibold text-cta underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <p className="num mt-3 text-[13px] text-grey" aria-live="polite">
          {loading
            ? "Loading the menu…"
            : `${resultCount} item${resultCount === 1 ? "" : "s"}${query ? ` for “${query}”` : ""}` +
              (soldOutHere > 0 ? ` · ${soldOutHere} sold out here today` : "")}
        </p>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Sticky category chip bar below 1280                         */}
      {/* ---------------------------------------------------------- */}
      <div className="sticky top-16 z-20 mt-5 border-y border-line bg-cream/95 backdrop-blur-sm lg:top-18 xl:hidden">
        <nav aria-label="Menu categories" className="container-page">
          <ul className="flex gap-2 overflow-x-auto py-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Chip active={activeCategory === c.id} onClick={() => jumpTo(c.id)}>
                  {c.name}
                </Chip>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Two-pane body                                               */}
      {/* ---------------------------------------------------------- */}
      <div className="container-page grid items-start gap-8 pt-8 xl:grid-cols-[210px_minmax(0,1fr)_296px]">
        {/* Left rail — 1280 and up */}
        <nav aria-label="Menu categories" className="sticky top-28 hidden xl:block">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-grey">
            Categories
          </p>
          <ul className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => {
              const count = sections.find((s) => s.category.id === c.id)?.items.length ?? 0;
              const current = activeCategory === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(c.id)}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium transition-colors",
                      current ? "bg-ink text-white" : "text-ink hover:bg-mint",
                    )}
                  >
                    <span className="min-w-0 truncate">{c.name}</span>
                    <span className={cn("num text-[12px]", current ? "text-white/70" : "text-grey")}>
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-[12px] leading-relaxed text-grey">
            Everything on this menu is prepared in a Muslim-friendly kitchen.
          </p>
        </nav>

        {/* Centre grid */}
        <div className="min-w-0">
          {loading ? (
            <MenuSkeleton />
          ) : resultCount === 0 ? (
            <EmptyState
              icon={narrowed ? "search" : "box"}
              title={narrowed ? "No dishes match those filters" : "Nothing here yet"}
              body={
                narrowed
                  ? "Try removing a filter, or search the full menu for something else."
                  : "This branch has not published any items yet. Try the other branch."
              }
              action={
                narrowed ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-11 items-center rounded-full border border-ink/20 bg-white px-5 text-[15px] font-semibold text-ink hover:bg-mint"
                    >
                      Clear filters
                    </button>
                    <ButtonLink href="/search" variant="primary" iconEnd="arrowRight">
                      Search the menu
                    </ButtonLink>
                  </div>
                ) : (
                  <ButtonLink href="/locations" variant="secondary">
                    See both branches
                  </ButtonLink>
                )
              }
            />
          ) : (
            <div className="flex flex-col gap-12">
              {visible.map(({ category, items }) => (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  ref={(el) => {
                    sectionRefs.current[category.id] = el;
                  }}
                  aria-labelledby={`heading-${category.id}`}
                  className="scroll-mt-36 xl:scroll-mt-28"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 id={`heading-${category.id}`} className="text-[24px] leading-tight">
                      {category.name}
                    </h2>
                    <p className="num text-[13px] font-semibold text-grey">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="mt-1 text-[14px] text-grey">{category.blurb}</p>

                  {items.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        compact
                        icon="box"
                        title={`Nothing in ${category.name} right now`}
                        body="Check back later or switch branch — stock is set per branch each morning."
                      />
                    </div>
                  ) : (
                    <fieldset
                      disabled={sim.offline}
                      className={cn(
                        "mt-4 grid min-w-0 gap-4",
                        isNarrow ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
                      )}
                    >
                      <legend className="sr-only">
                        {category.name}
                        {sim.offline ? " — adding items is unavailable offline" : ""}
                      </legend>
                      {items.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          layout={isNarrow ? "row" : "grid"}
                        />
                      ))}
                    </fieldset>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Right cart rail — 1280 and up */}
        <aside aria-labelledby="cart-rail-title" className="sticky top-28 hidden xl:block">
          <Panel className="p-5">
            <h2 id="cart-rail-title" className="text-[17px]">
              Your order
            </h2>
            <p className="mt-1 text-[13px] text-grey">Collected at checkout, never before.</p>

            <div
              className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4"
              aria-live="polite"
            >
              <span className="num text-[14px] text-grey">
                {cartCount} item{cartCount === 1 ? "" : "s"}
              </span>
              <span className="num text-[22px] font-bold text-ink">{money(totals.total)}</span>
            </div>

            {cartCount === 0 ? (
              <p className="mt-3 text-[13px] leading-relaxed text-grey">
                Your cart is empty. Add something and the total will appear here.
              </p>
            ) : (
              <p className="mt-2 text-[12px] text-grey">
                Includes SST. {draft.fulfilment === "delivery" ? "Delivery fee" : "Pickup"} shown at
                checkout.
              </p>
            )}

            <ButtonLink href="/cart" full className="mt-4" iconEnd="arrowRight">
              View cart
            </ButtonLink>
          </Panel>
        </aside>
      </div>

      {/* Sticky cart bar below 1280 */}
      {cartCount > 0 && (
        <div className="sticky bottom-14 z-20 mt-8 border-t border-line bg-white lg:bottom-0 xl:hidden">
          <div className="container-page flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="num text-[13px] text-grey">
                {cartCount} item{cartCount === 1 ? "" : "s"}
              </p>
              <p className="num text-[18px] font-bold leading-tight text-ink">
                {money(totals.total)}
              </p>
            </div>
            <ButtonLink href="/cart" iconEnd="arrowRight">
              View cart
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-12" aria-hidden>
      {[0, 1].map((section) => (
        <div key={section}>
          <div className="shimmer h-6 w-48 rounded-[8px]" />
          <div className="shimmer mt-2 h-3.5 w-64 rounded-[6px]" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((card) => (
              <SkeletonCard key={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
