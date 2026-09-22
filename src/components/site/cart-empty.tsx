"use client";

import { PRODUCTS, branchById } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ButtonLink, EmptyState } from "@/components/ui/primitives";
import { ProductCard } from "@/components/site/product-card";

export function CartEmpty() {
  const { branchId } = useStore();
  const branch = branchById(branchId);

  const suggestions = PRODUCTS.filter(
    (p) => p.popular && (p.availability[branchId] ?? "available") !== "sold_out",
  ).slice(0, 3);

  return (
    <div>
      <EmptyState
        icon="cart"
        title="Your bag is empty"
        body="Nothing here yet. Add boneless chicken, a set under RM20 or a side, and it will show up on this page with your total."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/menu" iconEnd="arrowRight">
              Browse the menu
            </ButtonLink>
            <ButtonLink href="/promotions" variant="secondary" iconStart="tag">
              See this week&rsquo;s offers
            </ButtonLink>
          </div>
        }
      />

      {suggestions.length > 0 && (
        <section aria-labelledby="empty-suggestions-title" className="mt-10">
          <h2 id="empty-suggestions-title" className="text-[22px]">
            Start with one of these
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-grey">
            The three most ordered dishes at {branch.shortName} this week.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
