"use client";

import { CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { Chip, SelectField } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";

export type SpiceFilter = "any" | "none" | "mild" | "medium" | "hot";
export type SortKey = "relevance" | "price-asc" | "price-desc" | "popular" | "name";

export interface SearchFilterState {
  categoryId: string;
  spice: SpiceFilter;
  halalOnly: boolean;
  availableOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: SearchFilterState = {
  categoryId: "all",
  spice: "any",
  halalOnly: false,
  availableOnly: false,
  sort: "relevance",
};

const SPICE_FILTERS: { value: SpiceFilter; label: string; level: number | null }[] = [
  { value: "any", label: "Any heat", level: null },
  { value: "none", label: "No heat", level: 0 },
  { value: "mild", label: "Mild", level: 1 },
  { value: "medium", label: "Medium", level: 2 },
  { value: "hot", label: "Hot", level: 3 },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "popular", label: "Most ordered" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

export function matchesSpiceFilter(product: Product, spice: SpiceFilter): boolean {
  const level = SPICE_FILTERS.find((s) => s.value === spice)?.level;
  return level === null || level === undefined ? true : product.spiceLevel === level;
}

export function activeFilterCount(filters: SearchFilterState): number {
  return (
    (filters.categoryId !== "all" ? 1 : 0) +
    (filters.spice !== "any" ? 1 : 0) +
    (filters.halalOnly ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  );
}

export function SearchFilters({
  filters,
  onChange,
  onClear,
  branchShortName,
}: {
  filters: SearchFilterState;
  onChange: (patch: Partial<SearchFilterState>) => void;
  onClear: () => void;
  branchShortName: string;
}) {
  const active = activeFilterCount(filters);

  return (
    <section aria-labelledby="filters-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="filters-title" className="flex items-center gap-2 text-[16px]">
          <Icon name="filter" size={16} />
          Narrow it down
        </h2>
        <div className="w-full max-w-60 sm:w-auto">
          <SelectField
            label="Sort results by"
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as SortKey })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        <Chip active={filters.categoryId === "all"} onClick={() => onChange({ categoryId: "all" })}>
          Everything
        </Chip>
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            active={filters.categoryId === category.id}
            onClick={() => onChange({ categoryId: category.id })}
          >
            {category.name}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by spice level" className="flex flex-wrap gap-2">
          <span className="self-center text-[12px] font-bold uppercase tracking-[0.12em] text-grey">
            Spice
          </span>
          {SPICE_FILTERS.map((option) => (
            <Chip
              key={option.value}
              active={filters.spice === option.value}
              onClick={() => onChange({ spice: option.value })}
            >
              {option.label}
            </Chip>
          ))}
        </div>

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />

        <Chip
          icon="shield"
          active={filters.halalOnly}
          onClick={() => onChange({ halalOnly: !filters.halalOnly })}
        >
          Halal-certified kitchen
        </Chip>
        <Chip
          icon="check"
          active={filters.availableOnly}
          onClick={() => onChange({ availableOnly: !filters.availableOnly })}
        >
          In stock at {branchShortName}
        </Chip>

        {active > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="ml-1 inline-flex min-h-11 items-center text-[13px] font-semibold text-cta underline underline-offset-2"
          >
            Clear {active} filter{active === 1 ? "" : "s"}
          </button>
        )}
      </div>
    </section>
  );
}
