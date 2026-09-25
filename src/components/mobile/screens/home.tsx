"use client";

import { BRANCHES, CATEGORIES, MOCK_ORDERS, MOCK_USER, PRODUCTS, PROMOTIONS } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import {
  AndroidHeader,
  AndroidNavBar,
  DeviceFrame,
  IosHeader,
  IosTabBar,
  tabsWith,
  type Platform,
} from "@/components/mobile/device";
import { PromoBadge } from "@/components/ui/primitives";
import { FoodImage } from "@/components/ui/media";
import { Icon, type IconKey } from "@/components/ui/icons";
import {
  Fab,
  FieldLabel,
  MobileChip,
  ScreenBody,
  ScreenContent,
  designedCloses,
} from "./shared";

const SS15 = BRANCHES[0];
const LIVE = MOCK_ORDERS[0];
const FEATURED = PRODUCTS.filter((p) => p.popular).slice(0, 5);
const PROMOS = PROMOTIONS.slice(0, 3);

/** Categories carry their own icon names; map them onto the app icon set. */
const CATEGORY_ICON: Record<string, IconKey> = {
  signature: "cook",
  sets: "box",
  sharing: "users",
  sides: "bag",
  drinks: "sparkle",
  photobooth: "camera",
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function BranchChip({ platform }: { platform: Platform }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3",
        platform === "ios"
          ? "ios-press h-11 rounded-full bg-white ring-1 ring-line"
          : "ripple h-11 rounded-[10px] bg-mint",
      )}
    >
      <span className="text-deep">
        <Icon name="pin" size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
        {SS15.shortName}
      </span>
      <span className="num text-[12px] text-grey">until {designedCloses(SS15)}</span>
      <span className="text-grey" aria-hidden>
        <Icon name={platform === "ios" ? "chevronRight" : "chevronDown"} size={14} />
      </span>
    </div>
  );
}

function SearchEntry({ platform }: { platform: Platform }) {
  if (platform === "ios") {
    return (
      <div className="ios-press flex h-11 items-center gap-2 rounded-[10px] bg-ink/8 px-3">
        <span className="text-grey">
          <Icon name="search" size={16} />
        </span>
        <span className="text-[16px] text-grey">Search the menu</span>
      </div>
    );
  }
  return (
    <div className="ripple flex h-14 items-center gap-3 rounded-full bg-white px-4 shadow-[0_1px_3px_rgba(0,0,0,0.14)]">
      <span className="text-ink">
        <Icon name="search" size={20} />
      </span>
      <span className="flex-1 text-[15px] text-grey">Search the menu</span>
      <span className="flex size-8 items-center justify-center rounded-full bg-mint font-display text-[12px] font-bold text-deep">
        AR
      </span>
    </div>
  );
}

function LiveOrderBanner({ platform }: { platform: Platform }) {
  if (platform === "ios") {
    return (
      <div className="sticky top-11 z-10 border-b border-line bg-mint px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot mt-0.5 size-2.5 shrink-0 rounded-full bg-deep" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-ink">
              Sending to the kitchen · {money(LIVE.total)}
            </span>
            <span className="num block text-[12px] text-deep">
              {LIVE.code} · SS15 has 4:23 to accept
            </span>
          </span>
          <span className="ios-press shrink-0 text-[15px] font-semibold text-deep">Track</span>
        </div>
      </div>
    );
  }
  return (
    <div className="border-b border-line bg-mint px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-deep text-white">
          <Icon name="hourglass" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink">Order on the way to the kitchen</p>
          <p className="num mt-0.5 text-[12px] text-ink/75">
            {LIVE.code} · {money(LIVE.total)} · SS15 has 4:23 to accept
          </p>
          <div className="-ml-2 mt-1 flex">
            <span className="ripple inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold uppercase tracking-wide text-deep">
              Track order
            </span>
            <span className="ripple inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-bold uppercase tracking-wide text-grey">
              Dismiss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoRail({ platform }: { platform: Platform }) {
  return (
    <div className="-mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
      {PROMOS.map((p) => (
        <article
          key={p.id}
          className={cn(
            "flex w-58 shrink-0 flex-col justify-between p-3.5",
            platform === "ios"
              ? "ios-press rounded-[14px] bg-yellow/70 ring-1 ring-ink/10"
              : "ripple rounded-[16px] bg-yellow/70 shadow-[0_1px_3px_rgba(0,0,0,0.16)]",
          )}
        >
          <div>
            <PromoBadge>{p.badge}</PromoBadge>
            <h4 className="mt-2 text-[15px] leading-tight">{p.name}</h4>
            <p className="mt-1 text-[12px] leading-snug text-ink/75">{p.description}</p>
          </div>
          <p className="num mt-2.5 text-[11px] font-semibold text-ink/70">
            {p.code ? `Code ${p.code}` : "Applied automatically"} · ends {p.endsOn}
          </p>
        </article>
      ))}
    </div>
  );
}

function CategoryRow({ platform }: { platform: Platform }) {
  return (
    <ul className="-mx-4 mt-2 flex gap-2.5 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((c, i) => (
        <li key={c.id}>
          <div
            className={cn(
              "flex w-18 flex-col items-center gap-1.5 py-1",
              platform === "ios" ? "ios-press" : "ripple rounded-[12px]",
            )}
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center text-deep",
                platform === "ios"
                  ? "rounded-[18px] bg-mint"
                  : i === 0
                    ? "rounded-full bg-deep text-white"
                    : "rounded-full bg-mint",
              )}
            >
              <Icon name={CATEGORY_ICON[c.id]} size={22} />
            </span>
            <span className="text-center text-[11px] font-semibold leading-tight text-ink">
              {c.name}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FeaturedRail({ platform }: { platform: Platform }) {
  return (
    <ul className="-mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
      {FEATURED.map((p) => (
        <li key={p.id} className="w-40 shrink-0">
          <article
            className={cn(
              "flex h-full flex-col overflow-hidden bg-white",
              platform === "ios"
                ? "ios-press rounded-[14px] ring-1 ring-line"
                : "ripple rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.16)]",
            )}
          >
            <FoodImage
              src={p.image}
              alt={p.name}
              className="aspect-[4/3] w-full"
              rounded="rounded-none"
            />
            <div className="flex flex-1 flex-col p-2.5">
              <h4 className="text-[13px] leading-snug">{p.name}</h4>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className="num text-[14px] font-bold text-ink">{money(p.price)}</span>
                {platform === "ios" ? (
                  <span className="flex size-8 items-center justify-center rounded-full bg-cta text-white">
                    <Icon name="plus" size={15} />
                  </span>
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-[10px] bg-mint text-deep">
                    <Icon name="plus" size={16} />
                  </span>
                )}
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* iOS                                                                 */
/* ------------------------------------------------------------------ */

function IosHomeFrame({ live }: { live: boolean }) {
  return (
    <DeviceFrame
      platform="ios"
      title={live ? "Home · live order pinned" : "Home"}
      caption={
        live
          ? "The live order pins under the large title as a banner and stays there while the page scrolls."
          : "Large-title header, a grey inset search field and a tab bar with the icon above the label."
      }
    >
      <ScreenBody platform="ios">
        <IosHeader
          title={`Hello, ${MOCK_USER.name.split(" ")[0]}`}
          large
          trailing={
            <span className="ios-press flex size-11 items-center justify-center text-deep">
              <Icon name="bell" size={21} />
            </span>
          }
        />
        {live && <LiveOrderBanner platform="ios" />}
        <ScreenContent className="pt-3">
          <BranchChip platform="ios" />
          <div className="mt-2.5">
            <SearchEntry platform="ios" />
          </div>

          <h3 className="mt-5 text-[19px]">This week</h3>
          <PromoRail platform="ios" />

          <h3 className="mt-5 text-[19px]">Categories</h3>
          <CategoryRow platform="ios" />

          <div className="mt-5 flex items-baseline justify-between gap-3">
            <h3 className="text-[19px]">Ordered most</h3>
            <span className="ios-press text-[14px] font-semibold text-deep">See all</span>
          </div>
          <FeaturedRail platform="ios" />

          <div className="mt-5 rounded-[14px] bg-mint p-3.5">
            <FieldLabel>Make it last</FieldLabel>
            <p className="mt-1 text-[14px] leading-snug text-ink/85">
              Visit the photo booth at our outlets after your meal.
            </p>
          </div>
          <p className="mt-4 text-[12px] leading-snug text-grey">
            Every item is prepared in a Muslim-friendly kitchen. Prices include SST at checkout.
          </p>
        </ScreenContent>
        <IosTabBar items={tabsWith("Home", 3)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosHome() {
  return <IosHomeFrame live={false} />;
}

export function IosHomeLiveOrder() {
  return <IosHomeFrame live />;
}

/* ------------------------------------------------------------------ */
/* Android                                                             */
/* ------------------------------------------------------------------ */

function AndroidHomeFrame({ live }: { live: boolean }) {
  return (
    <DeviceFrame
      platform="android"
      title={live ? "Home · live order banner" : "Home"}
      caption={
        live
          ? "Material top banner directly under the app bar, with text buttons for the two actions."
          : "Left-aligned app bar, a Material search bar with an account avatar, a FAB for the cart and an active pill in the navigation bar."
      }
    >
      <ScreenBody platform="android">
        <AndroidHeader
          title="Bang Ga Bang Ga"
          trailing={
            <span className="ripple mr-1 flex size-11 items-center justify-center rounded-full text-ink">
              <Icon name="bell" size={21} />
            </span>
          }
        />
        {live && <LiveOrderBanner platform="android" />}
        <ScreenContent className="pt-3">
          <SearchEntry platform="android" />
          <div className="mt-3 flex gap-2">
            <div className="min-w-0 flex-1">
              <BranchChip platform="android" />
            </div>
            <MobileChip platform="android" icon="bike">
              Delivery
            </MobileChip>
          </div>

          <h3 className="mt-5 text-[18px]">Hello, {MOCK_USER.name.split(" ")[0]}</h3>
          <p className="mt-0.5 text-[13px] text-grey">
            {SS15.shortName} is open until {designedCloses(SS15)} today.
          </p>

          <div className="mt-4 flex items-baseline justify-between gap-3">
            <h3 className="text-[18px]">This week</h3>
            <span className="ripple -mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-[13px] font-bold uppercase tracking-wide text-deep">
              See all
            </span>
          </div>
          <PromoRail platform="android" />

          <h3 className="mt-5 text-[18px]">Categories</h3>
          <CategoryRow platform="android" />

          <h3 className="mt-5 text-[18px]">Ordered most</h3>
          <FeaturedRail platform="android" />

          <div className="mt-5 rounded-[16px] bg-mint p-4">
            <FieldLabel>Make it last</FieldLabel>
            <p className="mt-1 text-[14px] leading-snug text-ink/85">
              Visit the photo booth at our outlets after your meal.
            </p>
          </div>
          <p className="mt-4 pb-6 text-[12px] leading-snug text-grey">
            Every item is prepared in a Muslim-friendly kitchen. Prices include SST at checkout.
          </p>
        </ScreenContent>
        <Fab icon="cart" label="Open cart, 3 items" />
        <AndroidNavBar items={tabsWith("Home", 3)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidHome() {
  return <AndroidHomeFrame live={false} />;
}

export function AndroidHomeLiveOrder() {
  return <AndroidHomeFrame live />;
}
