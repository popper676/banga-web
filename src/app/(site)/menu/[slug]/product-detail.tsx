"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CATEGORIES, branchById, optionGroupById, promotionById } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CartLineOption, OptionGroup, Product } from "@/lib/types";
import {
  AvailabilityChip,
  Badge,
  Button,
  ButtonLink,
  Callout,
  KeyValue,
  Panel,
  Price,
  PromoBadge,
} from "@/components/ui/primitives";
import { ChoiceRow, QuantityStepper, TextAreaField } from "@/components/ui/forms";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "@/components/site/product-card";
import { BranchBanner } from "@/components/site/menu-branch-banner";
import { availabilityAt, spiceLabel } from "@/components/site/menu-filters";

const NOTES_MAX = 200;

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const { branchId, addLine, pushToast, sim } = useStore();

  const [shot, setShot] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const branch = branchById(branchId);
  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  const availability = availabilityAt(product, branchId);
  const soldOut = availability === "sold_out";
  const promo = promotionById(product.promotionId);

  const groups = useMemo(
    () =>
      product.optionGroupIds
        .map((id) => optionGroupById(id))
        .filter((g): g is OptionGroup => Boolean(g)),
    [product.optionGroupIds],
  );

  const chosen: CartLineOption[] = useMemo(
    () =>
      groups.flatMap((group) =>
        (selected[group.id] ?? []).flatMap((choiceId) => {
          const choice = group.choices.find((c) => c.id === choiceId);
          return choice
            ? [
                {
                  groupId: group.id,
                  groupName: group.name,
                  choiceId: choice.id,
                  choiceName: choice.name,
                  priceDelta: choice.priceDelta,
                },
              ]
            : [];
        }),
      ),
    [groups, selected],
  );

  const unitPrice = product.price + chosen.reduce((sum, o) => sum + o.priceDelta, 0);
  const lineTotal = unitPrice * quantity;

  const unmet = groups.find(
    (group) => group.required && (selected[group.id] ?? []).length < group.minSelect,
  );
  const canAdd = !soldOut && !unmet && !sim.offline;

  const groupRule = (group: OptionGroup): string => {
    if (group.required) return group.minSelect === 1 ? "Choose 1" : `Choose ${group.minSelect}`;
    if (group.maxSelect > 1) return `Up to ${group.maxSelect}`;
    return "Optional";
  };

  const toggle = (group: OptionGroup, choiceId: string) => {
    const current = selected[group.id] ?? [];
    if (group.maxSelect === 1) {
      const clearing = current[0] === choiceId && !group.required;
      setSelected({ ...selected, [group.id]: clearing ? [] : [choiceId] });
      return;
    }
    if (current.includes(choiceId)) {
      setSelected({ ...selected, [group.id]: current.filter((c) => c !== choiceId) });
      return;
    }
    if (current.length >= group.maxSelect) {
      pushToast({
        tone: "warning",
        title: `Up to ${group.maxSelect} ${group.name.toLowerCase()}`,
        body: "Remove one before adding another.",
      });
      return;
    }
    setSelected({ ...selected, [group.id]: [...current, choiceId] });
  };

  const addToCart = () => {
    if (!canAdd) return;
    addLine({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice,
      quantity,
      options: chosen,
      notes: notes.trim() ? notes.trim() : undefined,
    });
    pushToast({
      tone: "success",
      title: `${quantity} × ${product.name} added`,
      body: `${money(lineTotal)} · from ${branch.shortName}`,
      actionLabel: "View cart",
      onAction: () => router.push("/cart"),
    });
    setQuantity(1);
  };

  const notifyMe = () => {
    pushToast({
      tone: "neutral",
      title: "We’ll let you know",
      body: `${product.name} is sold out at ${branch.shortName} today. This is a prototype — no notification is actually sent.`,
    });
  };

  /* Three art-directed shots. Real photography replaces these later. */
  const shots = [
    {
      src: product.image,
      alt: `${product.name} served in a BANG GA BANG GA takeaway box`,
      variant: "dish" as const,
      label: "Full portion",
    },
    {
      src: `${product.image}#close`,
      alt: `Close-up of the coating and glaze on ${product.name}`,
      variant: "dish" as const,
      label: "Close up",
    },
    {
      src: `${product.image}#table`,
      alt: `${product.name} on a shared table with sides and iced barley tea`,
      variant: "scene" as const,
      label: "On the table",
    },
  ];
  const active = shots[shot];

  return (
    <div className="pb-4">
      <div className="container-page pt-6 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-grey">
            <li>
              <Link href="/menu" className="font-semibold text-deep underline underline-offset-2">
                Menu
              </Link>
            </li>
            <li aria-hidden>
              <Icon name="chevronRight" size={13} />
            </li>
            {category && (
              <>
                <li>
                  <Link
                    href={`/menu?category=${category.slug}`}
                    className="font-semibold text-deep underline underline-offset-2"
                  >
                    {category.name}
                  </Link>
                </li>
                <li aria-hidden>
                  <Icon name="chevronRight" size={13} />
                </li>
              </>
            )}
            <li aria-current="page" className="font-medium text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          {/* ------------------------------------------------------ */}
          {/* Gallery                                                 */}
          {/* ------------------------------------------------------ */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FoodImage
              key={active.src}
              src={active.src}
              alt={active.alt}
              variant={active.variant}
              className="aspect-[4/3] w-full"
              rounded="rounded-[22px]"
            />
            <div
              role="group"
              aria-label={`Photos of ${product.name}`}
              className="mt-3 grid grid-cols-3 gap-3"
            >
              {shots.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-pressed={shot === i}
                  className={cn(
                    "overflow-hidden rounded-[14px] border-2 p-1 text-left transition-colors",
                    shot === i ? "border-ink bg-mint" : "border-line bg-white hover:border-ink/40",
                  )}
                >
                  <FoodImage
                    src={s.src}
                    alt={s.alt}
                    variant={s.variant}
                    className="aspect-[4/3] w-full"
                    rounded="rounded-[9px]"
                  />
                  <span className="mt-1 block px-0.5 pb-0.5 text-[11px] font-semibold text-ink">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-grey">
              Photography placeholder — the final shoot replaces these three frames.
            </p>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Detail + options                                        */}
          {/* ------------------------------------------------------ */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {promo && <PromoBadge>{promo.badge}</PromoBadge>}
              {product.muslimFriendly && (
                <Badge tone="success" icon="shield">
                  Muslim-friendly
                </Badge>
              )}
              {availability === "available" ? (
                <Badge tone="info" icon="check" soft>
                  Available at {branch.shortName}
                </Badge>
              ) : (
                <AvailabilityChip state={availability} branchName={branch.shortName} />
              )}
            </div>

            <h1 className="mt-3 text-[clamp(28px,4vw,44px)] leading-[1.05]">{product.name}</h1>
            {product.koreanName && (
              <p lang="ko" className="mt-1.5 text-[18px] font-medium text-deep">
                {product.koreanName}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Price sen={product.price} size="lg" />
              <span className="text-[13px] text-grey">before options</span>
            </div>

            <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink/80">
              {product.longDescription}
            </p>

            <Panel className="mt-5 p-4">
              <dl>
                <KeyValue
                  k="Spice level"
                  v={
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden className="text-cta">
                        {product.spiceLevel > 0 ? "◆".repeat(product.spiceLevel) : "○"}
                      </span>
                      {spiceLabel(product.spiceLevel)}
                    </span>
                  }
                />
                <KeyValue
                  k="Allergens"
                  v={product.allergens.length > 0 ? product.allergens.join(", ") : "None declared"}
                />
                <KeyValue k="Energy" v={`${product.kcal} kcal`} mono />
              </dl>
              <p className="mt-2 border-t border-line pt-3 text-[12px] leading-relaxed text-grey">
                Allergen information is indicative. Tell the branch about a severe allergy before
                ordering — our kitchen handles wheat, dairy, egg, soy and sesame.
              </p>
            </Panel>

            {sim.offline && (
              <Callout
                tone="danger"
                icon="wifiOff"
                role="alert"
                className="mt-5"
                title="You’re offline"
              >
                We can show you this item, but adding it to the cart needs a connection.
              </Callout>
            )}

            {soldOut && (
              <Callout
                tone="warning"
                className="mt-5"
                title={`Sold out at ${branch.shortName} today`}
                action={<ButtonLink href="/menu" size="sm" variant="secondary">Browse menu</ButtonLink>}
              >
                Switch branch from the strip below, or ask us to flag it when it is back.
              </Callout>
            )}

            <div className="mt-5">
              <BranchBanner
                label="Options and stock for"
                note="Some choices sell out per branch during the day."
              />
            </div>

            {/* ---------------------------------------------------- */}
            {/* Option groups                                         */}
            {/* ---------------------------------------------------- */}
            {groups.length > 0 && (
              <div className="mt-8 flex flex-col gap-7">
                {groups.map((group) => {
                  const current = selected[group.id] ?? [];
                  const atMax = group.maxSelect > 1 && current.length >= group.maxSelect;
                  return (
                    <fieldset key={group.id} className="min-w-0">
                      <legend className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-display text-[18px] font-bold text-ink">
                          {group.name}
                        </span>
                        <Badge tone={group.required ? "warning" : "neutral"} soft icon={group.required ? "alert" : "sparkle"}>
                          {group.required ? `Required · ${groupRule(group)}` : groupRule(group)}
                        </Badge>
                      </legend>
                      {group.helper && (
                        <p className="mb-3 text-[13px] text-grey">{group.helper}</p>
                      )}
                      <div className="flex flex-col gap-2">
                        {group.choices.map((choice) => {
                          const choiceSoldOut = choice.soldOutAt?.includes(branchId) ?? false;
                          const blockedByMax = atMax && !current.includes(choice.id);
                          return (
                            <ChoiceRow
                              key={choice.id}
                              type={group.maxSelect === 1 ? "radio" : "checkbox"}
                              name={`group-${group.id}`}
                              checked={current.includes(choice.id)}
                              onChange={() => toggle(group, choice.id)}
                              disabled={choiceSoldOut || blockedByMax || soldOut}
                              disabledReason={
                                choiceSoldOut
                                  ? `Sold out at ${branch.shortName} today`
                                  : blockedByMax
                                    ? `You already picked ${group.maxSelect}`
                                    : undefined
                              }
                              title={choice.name}
                              priceDelta={choice.priceDelta}
                            />
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* Kitchen notes                                         */}
            {/* ---------------------------------------------------- */}
            <div className="mt-8">
              <TextAreaField
                label="Notes for the kitchen"
                hint="We’ll do our best, but changes aren’t guaranteed."
                placeholder="e.g. less spicy please, sauce on the side"
                value={notes}
                maxLength={NOTES_MAX}
                showCount
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="num sr-only" aria-live="polite">
                {notes.length} of {NOTES_MAX} characters used
              </p>
            </div>

            <div className="h-6" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Frequently ordered with                                     */}
      {/* ---------------------------------------------------------- */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-page mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="related-title" className="text-[24px]">
              Frequently ordered with
            </h2>
            <Link
              href="/menu"
              className="text-[14px] font-semibold text-deep underline underline-offset-2"
            >
              See the full menu
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Sticky footer action                                        */}
      {/* ---------------------------------------------------------- */}
      <div className="sticky bottom-14 z-30 mt-10 border-t border-line bg-white lg:bottom-0">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
          {soldOut ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink">
                  Sold out at {branch.shortName}
                </p>
                <p className="text-[13px] text-grey">
                  Change branch above to check the other kitchen.
                </p>
              </div>
              <Button variant="dark" size="lg" iconStart="bell" onClick={notifyMe}>
                Notify me when available
              </Button>
            </>
          ) : (
            <>
              <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={20} />
              <div className="min-w-0 flex-1" aria-live="polite">
                <p className="num text-[13px] text-grey">
                  {quantity} × {money(unitPrice)}
                </p>
                {(sim.offline || unmet) && (
                  <p className="text-[13px] font-medium text-cta">
                    {sim.offline
                      ? "Offline — reconnect to add this to your cart."
                      : `Choose your ${unmet?.name.toLowerCase()} to continue.`}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                onClick={addToCart}
                disabled={!canAdd}
                iconStart="cart"
                className="min-w-56"
              >
                Add to cart · {money(lineTotal)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}