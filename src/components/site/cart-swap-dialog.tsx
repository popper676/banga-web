"use client";

/**
 * Offered when a line in the bag is sold out at the selected branch. Every
 * alternative here is in stock at that branch today, priced as close to the
 * original as the catalogue allows.
 */

import { useRouter } from "next/navigation";
import { PRODUCTS, branchById, productById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CartLine, Product } from "@/lib/types";
import { Badge, Button, Price } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/overlays";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";

export function CartSwapDialog({
  open,
  onClose,
  line,
}: {
  open: boolean;
  onClose: () => void;
  line: CartLine;
}) {
  const router = useRouter();
  const { branchId, addLine, removeLine, pushToast } = useStore();
  const branch = branchById(branchId);
  const original = productById(line.productId);

  const inStock = PRODUCTS.filter(
    (p) => p.id !== line.productId && (p.availability[branchId] ?? "available") === "available",
  );
  const closestFirst = (a: Product, b: Product) =>
    Math.abs(a.price - line.unitPrice) - Math.abs(b.price - line.unitPrice);

  const alternatives = [
    ...inStock.filter((p) => p.categoryId === original?.categoryId).sort(closestFirst),
    ...inStock.filter((p) => p.categoryId !== original?.categoryId && p.popular).sort(closestFirst),
  ].slice(0, 3);

  const swap = (product: Product) => {
    // Anything with options needs the full choice flow, exactly as the menu does.
    if (product.optionGroupIds.length > 0) {
      router.push(`/menu/${product.slug}`);
      onClose();
      return;
    }
    removeLine(line.lineId);
    addLine({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity: line.quantity,
      options: [],
      notes: line.notes,
    });
    pushToast({
      tone: "success",
      title: `Swapped to ${product.name}`,
      body: `${line.name} is sold out at ${branch.shortName} today.`,
    });
    onClose();
  };

  const removeInstead = () => {
    removeLine(line.lineId);
    pushToast({
      tone: "neutral",
      title: `${line.name} removed`,
      body: "It was sold out at this branch, so it was never part of your total.",
      actionLabel: "Undo",
      onAction: () =>
        addLine({
          productId: line.productId,
          name: line.name,
          image: line.image,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          options: line.options,
          notes: line.notes,
        }),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Swap ${line.name}`}
      description={`It is sold out at ${branch.shortName} today. These are in stock right now and cost about the same.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Keep it for now
          </Button>
          <Button variant="destructive" iconStart="trash" onClick={removeInstead}>
            Remove instead
          </Button>
        </>
      }
    >
      {alternatives.length === 0 ? (
        <p className="text-[15px] leading-relaxed text-ink/80">
          Nothing comparable is in stock at {branch.shortName} today. Remove this item, or switch to
          our other branch from the strip at the top of your bag.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {alternatives.map((product) => {
            const needsOptions = product.optionGroupIds.length > 0;
            const difference = product.price - line.unitPrice;
            return (
              <li
                key={product.id}
                className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3"
              >
                <FoodImage
                  src={product.image}
                  alt={product.name}
                  className="size-16 shrink-0"
                  rounded="rounded-[10px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-ink">{product.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-grey">
                    {product.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Price sen={product.price} size="sm" />
                    <span className="num text-[12px] text-grey">
                      {difference === 0
                        ? "Same price"
                        : difference > 0
                          ? `${money(difference)} more`
                          : `${money(Math.abs(difference))} less`}
                    </span>
                    {product.muslimFriendly && (
                      <Badge tone="info" soft icon="shield">
                        Muslim-friendly
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="md"
                  variant={needsOptions ? "secondary" : "primary"}
                  onClick={() => swap(product)}
                  className="shrink-0"
                >
                  {needsOptions ? "Choose options" : "Swap"}
                  <span className="sr-only"> — {product.name}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-1.5 text-[12px] leading-relaxed text-grey">
        <span className="mt-px shrink-0 text-deep">
          <Icon name="shield" size={13} />
        </span>
        Stock is set per branch each morning. Swapping only changes this line — the rest of your bag
        stays exactly as it is.
      </p>
    </Dialog>
  );
}
