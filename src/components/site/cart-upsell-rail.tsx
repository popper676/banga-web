"use client";

/**
 * "Goes well with this" — sides, drinks and a booth session that are in stock
 * at the selected branch and not already in the bag.
 */

import { PRODUCTS, branchById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/site/product-card";

const COMPANION_CATEGORIES = ["sides", "drinks", "photobooth"];

export function CartUpsellRail() {
  const { branchId, lines } = useStore();
  const branch = branchById(branchId);

  const inBag = new Set(lines.map((l) => l.productId));
  const inStock = (p: Product) => (p.availability[branchId] ?? "available") !== "sold_out";
  const selectable = PRODUCTS.filter((p) => !inBag.has(p.id) && inStock(p));

  const companions = selectable
    .filter((p) => COMPANION_CATEGORIES.includes(p.categoryId))
    .sort((a, b) => Number(b.popular) - Number(a.popular));
  const companionIds = new Set(companions.map((p) => p.id));
  const fallback = selectable.filter((p) => p.popular && !companionIds.has(p.id));

  const picks = [...companions, ...fallback].slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="upsell-title" className="mt-10">
      <h2 id="upsell-title" className="text-[22px]">
        Goes well with this
      </h2>
      <p className="mt-1 text-[14px] leading-relaxed text-grey">
        Sides, drinks and a photo booth session — all in stock at {branch.shortName} today.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {picks.map((product) => (
          <ProductCard key={product.id} product={product} layout="row" />
        ))}
      </div>
    </section>
  );
}
