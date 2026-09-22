"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { ButtonLink, EmptyState, SkeletonCard } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "@/components/site/product-card";
import { Highlight, matchContext } from "./search-matching";

export function SearchResultsGrid({
  products,
  terms,
}: {
  products: Product[];
  terms: string[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="flex min-w-0 flex-col gap-1.5">
          <ProductCard product={product} />
          <MatchLine product={product} terms={terms} />
        </li>
      ))}
    </ul>
  );
}

/** Says where the dish matched and marks the matched text inside it. */
function MatchLine({ product, terms }: { product: Product; terms: string[] }) {
  const context = matchContext(product, terms);
  if (!context) return null;
  return (
    <p className="px-1 text-[12px] leading-snug text-grey">
      <span className="font-bold uppercase tracking-[0.1em] text-deep">{context.label} match</span>{" "}
      · <Highlight text={context.text} terms={terms} />
    </p>
  );
}

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SearchZeroState({
  query,
  suggestion,
  nearest,
  onUseSuggestion,
  onClearFilters,
  filtersActive,
}: {
  query: string;
  suggestion: string | null;
  nearest: Product[];
  onUseSuggestion: (value: string) => void;
  onClearFilters: () => void;
  filtersActive: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <EmptyState
        icon="search"
        title={`No dishes matched “${query}”`}
        body={
          filtersActive
            ? "Nothing in the menu matches that word with the filters you have on. Clearing them usually helps."
            : "Nothing in the menu matches that word. Check the spelling, try a shorter word, or start from a category."
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {filtersActive && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-11 items-center rounded-full border border-ink/20 bg-white px-5 text-[15px] font-semibold text-ink hover:bg-mint"
              >
                Clear all filters
              </button>
            )}
            <ButtonLink href="/menu" iconEnd="arrowRight">
              Browse the full menu
            </ButtonLink>
          </div>
        }
      />

      {suggestion && (
        <p className="text-[16px] leading-relaxed text-ink">
          Did you mean{" "}
          <button
            type="button"
            onClick={() => onUseSuggestion(suggestion)}
            className="font-display text-[17px] font-bold text-cta underline underline-offset-4"
          >
            {suggestion}
          </button>
          ?
        </p>
      )}

      {nearest.length > 0 && (
        <section aria-labelledby="nearest-title">
          <h2 id="nearest-title" className="text-[20px]">
            Closest dishes we have
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-grey">
            Ranked by how close the spelling is to what you typed.
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearest.map((product) => (
              <li key={product.id} className="min-w-0">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="popular-categories-title">
        <h2 id="popular-categories-title" className="flex items-center gap-2 text-[20px]">
          <Icon name="grid" size={17} />
          Popular categories
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link
                href={`/menu?category=${category.slug}`}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:border-ink/45 hover:bg-mint"
              >
                {category.name}
                <Icon name="chevronRight" size={14} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
