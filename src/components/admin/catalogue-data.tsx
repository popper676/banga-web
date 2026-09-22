"use client";

/**
 * Catalogue-side admin data that does not belong in the shared domain model:
 * per-branch price overrides, category ordering, stock rules. Mock only.
 */

import { BRANCHES, CATEGORIES, OPTION_GROUPS, PRODUCTS } from "@/lib/mock-data";
import type { Availability, Product } from "@/lib/types";

export const SPICE_LABELS = ["No heat", "Mild", "Medium", "Extra hot"] as const;

export function spiceLabel(level: Product["spiceLevel"]): string {
  return SPICE_LABELS[level];
}

export const AVAILABILITY_ORDER: Availability[] = ["available", "low", "sold_out"];

/** Branch overrides are the exception, not the rule — campus pricing is lower. */
export const PRICE_OVERRIDES: Record<string, Record<string, number>> = {
  "p-soy": { taylors: 1500 },
  "p-set-soy": { taylors: 1790 },
  "p-set-yangnyeom": { taylors: 1850 },
  "p-platter-friends": { taylors: 8500 },
  "p-booth-session": { taylors: 100 },
};

export function priceAt(product: Product, branchId: string): number {
  return PRICE_OVERRIDES[product.id]?.[branchId] ?? product.price;
}

export function hasOverride(product: Product, branchId: string): boolean {
  return PRICE_OVERRIDES[product.id]?.[branchId] !== undefined;
}

/* ------------------------------------------------------------------ */
/* Categories — admin view adds order, visibility and a hero slot      */
/* ------------------------------------------------------------------ */

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  blurb: string;
  order: number;
  visible: boolean;
  heroImage: string;
  itemCount: number;
}

export const CATEGORY_ROWS: CategoryRow[] = CATEGORIES.map((c, i) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  blurb: c.blurb,
  order: i + 1,
  visible: true,
  heroImage: `/images/categories/${c.slug}.jpg`,
  itemCount: PRODUCTS.filter((p) => p.categoryId === c.id).length,
}));

/* ------------------------------------------------------------------ */
/* Option groups — how many dishes use each                            */
/* ------------------------------------------------------------------ */

export function dishesUsing(groupId: string): Product[] {
  return PRODUCTS.filter((p) => p.optionGroupIds.includes(groupId));
}

export const OPTION_GROUP_IDS = OPTION_GROUPS.map((g) => g.id);

export function selectionRuleLabel(group: {
  required: boolean;
  minSelect: number;
  maxSelect: number;
}): string {
  const mode = group.maxSelect > 1 ? "Multiple" : "Single";
  const bounds =
    group.maxSelect > 1
      ? `choose ${group.minSelect}–${group.maxSelect}`
      : group.required
        ? "choose exactly 1"
        : "choose up to 1";
  return `${mode} · ${bounds}`;
}

/* ------------------------------------------------------------------ */
/* Inventory rules                                                     */
/* ------------------------------------------------------------------ */

export interface StockRules {
  lowStockThreshold: number;
  autoSoldOutAtZero: boolean;
  dailyResetTime: string;
}

export const DEFAULT_STOCK_RULES: StockRules = {
  lowStockThreshold: 6,
  autoSoldOutAtZero: true,
  dailyResetTime: "09:30",
};

/** Simulated counted stock per dish per branch, used for the low-stock rule. */
export const COUNTED_STOCK: Record<string, Record<string, number>> = Object.fromEntries(
  PRODUCTS.map((p) => [
    p.id,
    Object.fromEntries(
      BRANCHES.map((b) => {
        const state = p.availability[b.id];
        const seed = (p.id.length * 7 + b.id.length * 3) % 9;
        return [b.id, state === "sold_out" ? 0 : state === "low" ? 2 + (seed % 3) : 12 + seed];
      }),
    ),
  ]),
);

export const MENU_TAG_OPTIONS = [
  "Bestseller",
  "Boneless",
  "Spicy",
  "Extra spicy",
  "Mild",
  "Classic",
  "Under RM20",
  "Set",
  "Sharing",
  "Street food",
  "Muslim-friendly",
  "New",
  "Popular",
];
