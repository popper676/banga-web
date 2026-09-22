"use client";

/**
 * Shared filtering helpers for the menu, product and cart surfaces.
 * Pure functions plus two small hooks — no network, no state library.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { branchStatus } from "@/lib/format";
import { branchById } from "@/lib/mock-data";
import type { Branch, Product } from "@/lib/types";

export type PriceBand = "any" | "under10" | "mid" | "over20";
export type SpiceFilter = "any" | "none" | "mild" | "medium" | "hot";

export const PRICE_BANDS: { value: PriceBand; label: string }[] = [
  { value: "any", label: "Any price" },
  { value: "under10", label: "Under RM10" },
  { value: "mid", label: "RM10 – RM20" },
  { value: "over20", label: "Over RM20" },
];

export const SPICE_OPTIONS: { value: SpiceFilter; label: string; level: number | null }[] = [
  { value: "any", label: "Any", level: null },
  { value: "none", label: "No heat", level: 0 },
  { value: "mild", label: "Mild", level: 1 },
  { value: "medium", label: "Medium", level: 2 },
  { value: "hot", label: "Hot", level: 3 },
];

const SPICE_NAMES = ["No heat", "Mild", "Medium", "Hot"];

export function spiceLabel(level: number): string {
  return SPICE_NAMES[level] ?? "Mild";
}

/** Every word in the query has to appear somewhere in the product text. */
export function matchesQuery(product: Product, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    product.name,
    product.koreanName ?? "",
    product.description,
    product.longDescription,
    ...product.tags,
    ...product.allergens,
  ]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function inPriceBand(price: number, band: PriceBand): boolean {
  if (band === "under10") return price < 1000;
  if (band === "mid") return price >= 1000 && price <= 2000;
  if (band === "over20") return price > 2000;
  return true;
}

export function matchesSpice(product: Product, spice: SpiceFilter): boolean {
  const target = SPICE_OPTIONS.find((o) => o.value === spice)?.level;
  return target === null || target === undefined ? true : product.spiceLevel === target;
}

/** Availability for a product at the branch the customer is ordering from. */
export function availabilityAt(product: Product, branchId: string) {
  return product.availability[branchId] ?? "available";
}

/**
 * Matches a CSS media query. Server render always resolves to `false` so the
 * markup is deterministic; React swaps in the real value after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Opening hours depend on the clock, so the status is resolved after mount.
 * `status` is null on the server render and for the first client paint.
 */
export function useBranchStatus(branchId: string): {
  branch: Branch;
  status: ReturnType<typeof branchStatus> | null;
} {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const branch = branchById(branchId);
  return { branch, status: now ? branchStatus(branch, now) : null };
}
