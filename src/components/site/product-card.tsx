"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { branchById, promotionById } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { AvailabilityChip, Price, PromoBadge } from "@/components/ui/primitives";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";

function discountedPrice(product: Product): number | undefined {
  const promo = promotionById(product.promotionId);
  if (!promo) return undefined;
  if (promo.type === "percentage") return Math.round(product.price * (1 - promo.value / 100));
  if (promo.type === "fixed" && product.price > promo.value) return product.price - promo.value;
  return undefined;
}

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "row";
}) {
  const router = useRouter();
  const { branchId, addLine, pushToast, sim } = useStore();
  const branch = branchById(branchId);
  const availability = product.availability[branchId] ?? "available";
  const soldOut = availability === "sold_out";
  const promo = promotionById(product.promotionId);
  const discounted = discountedPrice(product);
  const href = `/menu/${product.slug}`;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sim.offline) {
      pushToast({ tone: "warning", title: "You're offline", body: "Reconnect to add items to your cart." });
      return;
    }
    if (product.optionGroupIds.length > 0) {
      router.push(href);
      return;
    }
    addLine({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: 1,
      options: [],
    });
    pushToast({
      tone: "success",
      title: `${product.name} added`,
      body: `From ${branch.shortName}`,
      actionLabel: "View cart",
      onAction: () => router.push("/cart"),
    });
  };

  if (layout === "row") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-[14px] border border-line bg-white p-2.5 transition-colors hover:border-ink/35",
          soldOut && "opacity-70",
        )}
      >
        <FoodImage
          src={product.image}
          alt={product.name}
          className="size-[76px] shrink-0"
          rounded="rounded-[10px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[15px] font-semibold text-ink">{product.name}</p>
            {promo && !soldOut && <PromoBadge>{promo.badge}</PromoBadge>}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-grey">{product.description}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Price sen={discounted ?? product.price} original={discounted ? product.price : undefined} size="sm" />
            <AvailabilityChip state={availability} branchName={branch.shortName} />
          </div>
        </div>
        {soldOut ? (
          <span className="shrink-0 rounded-full border border-line px-3 py-2 text-[12px] font-semibold text-grey">
            Notify me
          </span>
        ) : (
          <button
            onClick={quickAdd}
            aria-label={`Add ${product.name} to cart`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cta text-white transition-colors hover:bg-cta-dark"
          >
            <Icon name="plus" size={18} />
          </button>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[16px] border border-line bg-white transition-colors hover:border-ink/35",
        soldOut && "opacity-80",
      )}
    >
      <div className="relative">
        <FoodImage
          src={product.image}
          alt={product.name}
          className={cn("aspect-[4/3] w-full", soldOut && "saturate-50")}
          rounded="rounded-none"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {promo && !soldOut && <PromoBadge>{promo.badge}</PromoBadge>}
          {product.tags.includes("Under RM20") && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink">
              Under RM20
            </span>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/75">
            <span className="rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white">
              Sold out at {branch.shortName}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] leading-snug">{product.name}</h3>
          {product.spiceLevel > 0 && (
            <span
              className="shrink-0 text-[11px] font-bold text-cta"
              title={`Spice level ${product.spiceLevel} of 3`}
            >
              {"◆".repeat(product.spiceLevel)}
              <span className="sr-only">Spice level {product.spiceLevel} of 3</span>
            </span>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <Price sen={discounted ?? product.price} original={discounted ? product.price : undefined} />
            {availability === "low" && (
              <p className="mt-1 text-[11px] font-semibold text-black">Low stock today</p>
            )}
          </div>
          {soldOut ? (
            <span className="rounded-full border border-line px-3 py-2 text-[12px] font-semibold text-grey">
              Notify me
            </span>
          ) : (
            <button
              onClick={quickAdd}
              aria-label={`Add ${product.name} to cart, ${money(discounted ?? product.price)}`}
              className="flex size-11 items-center justify-center rounded-full bg-cta text-white transition-colors hover:bg-cta-dark"
            >
              <Icon name="plus" size={18} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
