"use client";

import { useState } from "react";
import { BRANCHES, CATEGORIES, productById } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import type { Product } from "@/lib/types";
import {
  AndroidHeader,
  AndroidNavBar,
  DeviceFrame,
  IosHeader,
  IosTabBar,
  tabsWith,
  type Platform,
} from "@/components/mobile/device";
import { AvailabilityChip, Badge } from "@/components/ui/primitives";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  AndroidBottomSheet,
  AndroidSwitch,
  AndroidTabs,
  IosSegmented,
  IosSheet,
  IosSwitch,
  MobileChip,
  Overlay,
  ScreenBody,
  ScreenContent,
  SpiceLevel,
  designedCloses,
} from "./shared";

const SS15 = BRANCHES[0];

const SIGNATURE = ["p-soy", "p-yangnyeom", "p-honeybutter", "p-gochu"]
  .map((id) => productById(id))
  .filter((p): p is Product => Boolean(p));

const SIDES = ["p-tteokbokki", "p-corndog", "p-fries"]
  .map((id) => productById(id))
  .filter((p): p is Product => Boolean(p));

/* ------------------------------------------------------------------ */
/* Dish row — shared by menu browse and search results                 */
/* ------------------------------------------------------------------ */

export function DishRow({
  product,
  platform,
  branchId = SS15.id,
}: {
  product: Product;
  platform: Platform;
  branchId?: string;
}) {
  const availability = product.availability[branchId] ?? "available";
  const soldOut = availability === "sold_out";
  const branch = BRANCHES.find((b) => b.id === branchId) ?? SS15;

  return (
    <li
      className={cn(
        "flex items-start gap-3 py-3",
        platform === "ios" ? "border-b border-line/70 last:border-0" : "border-b border-line/60 last:border-0",
      )}
    >
      <FoodImage
        src={product.image}
        alt={product.name}
        className={cn("size-[72px] shrink-0", soldOut && "saturate-50")}
        rounded={platform === "ios" ? "rounded-[10px]" : "rounded-[14px]"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("text-[15px] leading-snug", soldOut && "text-grey")}>{product.name}</h4>
          <SpiceLevel level={product.spiceLevel} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-grey">
          {product.description}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="num text-[15px] font-bold text-ink">{money(product.price)}</span>
          {availability !== "available" && (
            <AvailabilityChip state={availability} branchName={branch.shortName} />
          )}
          {product.tags.includes("Under RM20") && (
            <Badge tone="neutral" soft icon="tag">
              Under RM20
            </Badge>
          )}
        </div>
        {soldOut && (
          <p className="mt-1 text-[12px] leading-snug text-grey">
            Back tomorrow morning. Tap Notify me and we will message you once.
          </p>
        )}
      </div>
      {soldOut ? (
        <span
          className={cn(
            "shrink-0 text-[12px] font-semibold text-deep",
            platform === "ios"
              ? "ios-press inline-flex min-h-11 items-center rounded-full px-3 ring-1 ring-line"
              : "ripple inline-flex min-h-11 items-center rounded-full px-3 ring-1 ring-line-dark/30",
          )}
        >
          Notify me
        </span>
      ) : (
        <button
          type="button"
          aria-label={`Add ${product.name}, ${money(product.price)}`}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center text-white",
            platform === "ios" ? "ios-press rounded-full bg-cta" : "ripple rounded-[14px] bg-cta",
          )}
        >
          <Icon name="plus" size={18} />
        </button>
      )}
    </li>
  );
}

function CartBar({ platform }: { platform: Platform }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex items-center gap-3 border-t border-line bg-white px-4 py-3",
        platform === "android" && "shadow-[0_-1px_0_rgba(0,0,0,0.08)]",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="num text-[12px] text-grey">3 items · SS15</p>
        <p className="num text-[17px] font-bold leading-tight text-ink">{money(5600)}</p>
      </div>
      {platform === "ios" ? (
        <span className="ios-press inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-cta px-5 text-[16px] font-semibold text-white">
          View cart
          <Icon name="arrowRight" size={17} />
        </span>
      ) : (
        <span className="ripple inline-flex min-h-12 items-center gap-2 rounded-full bg-cta px-6 text-[14px] font-bold text-white">
          View cart
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Menu browse                                                         */
/* ------------------------------------------------------------------ */

export function IosMenu() {
  const [active, setActive] = useState(CATEGORIES[0].id);
  return (
    <DeviceFrame
      platform="ios"
      title="Menu browse"
      caption="Centred navigation title with a Filter text button, and category chips in a sticky scrolling row. Tap a chip to move the selection."
    >
      <ScreenBody platform="ios">
        <IosHeader
          title="Menu"
          back="Home"
          trailing={<span className="ios-press pr-1 text-[16px] text-deep">Filter</span>}
        />
        <div className="sticky top-11 z-10 border-b border-line bg-cream/92 backdrop-blur">
          <ul className="flex gap-2 overflow-x-auto px-4 py-2">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setActive(c.id)} aria-pressed={active === c.id}>
                  <MobileChip platform="ios" active={active === c.id}>
                    {c.name}
                  </MobileChip>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ScreenContent className="pt-3">
          <div className="flex items-center gap-2 rounded-[12px] bg-mint px-3 py-2">
            <Icon name="pin" size={15} />
            <p className="num flex-1 text-[12px] font-medium text-deep">
              {SS15.shortName} · open until {designedCloses(SS15)}
            </p>
            <span className="ios-press text-[13px] font-semibold text-deep">Change</span>
          </div>

          <h3 className="mt-4 text-[20px]">Signature Chicken</h3>
          <p className="text-[12px] text-grey">Boneless, sauced, seriously good</p>
          <ul className="mt-1">
            {SIGNATURE.map((p) => (
              <DishRow key={p.id} product={p} platform="ios" />
            ))}
          </ul>

          <h3 className="mt-5 text-[20px]">Sides &amp; Snacks</h3>
          <p className="text-[12px] text-grey">Tteokbokki, kimbap, fries</p>
          <ul className="mt-1">
            {SIDES.map((p) => (
              <DishRow key={p.id} product={p} platform="ios" />
            ))}
          </ul>
        </ScreenContent>
        <CartBar platform="ios" />
        <IosTabBar items={tabsWith("Menu", 3)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidMenu() {
  return (
    <DeviceFrame
      platform="android"
      title="Menu browse"
      caption="Left-aligned app bar with icon actions, Material tabs with an underline indicator, and a filter chip row that reports how many filters are on."
    >
      <ScreenBody platform="android">
        <AndroidHeader
          title="Menu"
          back
          trailing={
            <span className="ripple mr-1 flex size-11 items-center justify-center rounded-full text-ink">
              <Icon name="search" size={21} />
            </span>
          }
        />
        <div className="sticky top-14 z-10 bg-cream shadow-[0_1px_0_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <AndroidTabs
                options={CATEGORIES.map((c) => c.name)}
                active={CATEGORIES[0].name}
                label="Menu categories"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-2">
            <MobileChip platform="android" active icon="filter">
              Filters · 2
            </MobileChip>
            <MobileChip platform="android" active>
              Under RM20
            </MobileChip>
            <MobileChip platform="android" icon="shield">
              Muslim-friendly
            </MobileChip>
            <MobileChip platform="android" icon="star">
              Popular
            </MobileChip>
          </div>
        </div>
        <ScreenContent className="pt-3">
          <div className="flex items-center gap-2 rounded-[12px] bg-mint px-3 py-2.5">
            <Icon name="pin" size={16} />
            <p className="num flex-1 text-[12px] font-medium text-deep">
              {SS15.shortName} · open until {designedCloses(SS15)}
            </p>
            <span className="ripple inline-flex min-h-11 items-center rounded-full px-2 text-[13px] font-bold uppercase tracking-wide text-deep">
              Change
            </span>
          </div>

          <h3 className="mt-4 text-[18px]">Signature Chicken</h3>
          <p className="text-[12px] text-grey">Boneless, sauced, seriously good</p>
          <ul className="mt-1">
            {SIGNATURE.map((p) => (
              <DishRow key={p.id} product={p} platform="android" />
            ))}
          </ul>

          <h3 className="mt-5 text-[18px]">Sides &amp; Snacks</h3>
          <p className="text-[12px] text-grey">Tteokbokki, kimbap, fries</p>
          <ul className="mt-1">
            {SIDES.map((p) => (
              <DishRow key={p.id} product={p} platform="android" />
            ))}
          </ul>
        </ScreenContent>
        <CartBar platform="android" />
        <AndroidNavBar items={tabsWith("Menu", 3)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

function FilterBackdrop({ platform }: { platform: Platform }) {
  return (
    <ScreenContent className="pt-3">
      <h3 className="text-[18px]">Signature Chicken</h3>
      <ul className="mt-1">
        {SIGNATURE.slice(0, 3).map((p) => (
          <DishRow key={p.id} product={p} platform={platform} />
        ))}
      </ul>
    </ScreenContent>
  );
}

export function IosMenuFilters() {
  return (
    <DeviceFrame
      platform="ios"
      title="Menu filters · modal sheet"
      caption="A half-height sheet with a grabber, a centred title and Done on the right. Toggles are iOS switches; spice uses a segmented control."
    >
      <ScreenBody platform="ios" clip>
        <IosHeader title="Menu" back="Home" trailing={<span className="pr-1 text-[16px] text-deep">Filter</span>} />
        <FilterBackdrop platform="ios" />
        <Overlay>
          <IosSheet title="Filters">
            <div className="rounded-[12px] border border-line bg-white px-3.5">
              <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2.5">
                <span className="text-[15px] text-ink">Muslim-friendly only</span>
                <IosSwitch on label="Muslim-friendly only" />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2.5">
                <span className="text-[15px] text-ink">Under RM20</span>
                <IosSwitch on label="Under RM20" />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2.5">
                <span className="text-[15px] text-ink">Hide sold out at SS15</span>
                <IosSwitch on={false} label="Hide sold out at SS15" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[15px] text-ink">Popular only</span>
                <IosSwitch on={false} label="Popular only" />
              </div>
            </div>

            <p className="px-1 pb-1.5 pt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-grey">
              Spice level
            </p>
            <IosSegmented options={["Any", "None", "Mild", "Hot"]} active="Any" label="Spice level" />

            <p className="mt-4 text-center text-[12px] text-grey">
              Showing 14 of 22 items at {SS15.shortName}
            </p>
          </IosSheet>
        </Overlay>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidMenuFilters() {
  return (
    <DeviceFrame
      platform="android"
      title="Menu filters · bottom sheet"
      caption="Material bottom sheet with a drag handle, a left-aligned title, Material switches and right-aligned text buttons for Reset and Apply."
    >
      <ScreenBody platform="android" clip>
        <AndroidHeader title="Menu" back />
        <FilterBackdrop platform="android" />
        <Overlay>
          <AndroidBottomSheet title="Filters">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[15px] text-ink">Muslim-friendly only</span>
                <AndroidSwitch on label="Muslim-friendly only" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[15px] text-ink">Under RM20</span>
                <AndroidSwitch on label="Under RM20" />
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[15px] text-ink">Hide sold out at SS15</span>
                <AndroidSwitch on={false} label="Hide sold out at SS15" />
              </div>
            </div>

            <p className="pb-2 pt-3 text-[13px] font-bold text-deep">Spice level</p>
            <div className="flex flex-wrap gap-2">
              <MobileChip platform="android" active>
                Any
              </MobileChip>
              <MobileChip platform="android">None</MobileChip>
              <MobileChip platform="android">Mild</MobileChip>
              <MobileChip platform="android">Hot</MobileChip>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <span className="ripple inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-bold uppercase tracking-wide text-grey">
                Reset
              </span>
              <span className="ripple inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-bold uppercase tracking-wide text-deep">
                Apply · 14 items
              </span>
            </div>
          </AndroidBottomSheet>
        </Overlay>
      </ScreenBody>
    </DeviceFrame>
  );
}

