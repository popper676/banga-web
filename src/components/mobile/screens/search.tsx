"use client";

import { productById } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { DeviceFrame } from "@/components/mobile/device";
import { Icon } from "@/components/ui/icons";
import { DishRow } from "./menu";
import {
  AndroidList,
  AndroidRow,
  IosGroup,
  IosRow,
  IosSegmented,
  MobileChip,
  ScreenBody,
  ScreenContent,
  SoftKeyboard,
} from "./shared";

const RECENT = ["yangnyeom", "tteokbokki", "sets under rm20", "corn dog"];
const POPULAR = ["Boneless chicken", "Cheese", "Under RM20", "Photo booth", "Spicy"];

const RESULTS = ["p-yangnyeom", "p-set-yangnyeom", "p-gochu"]
  .map((id) => productById(id))
  .filter((p): p is Product => Boolean(p));

/* ------------------------------------------------------------------ */
/* Focused, empty search                                               */
/* ------------------------------------------------------------------ */

export function IosSearchFocused() {
  return (
    <DeviceFrame
      platform="ios"
      title="Search · focused"
      caption="The navigation bar collapses into a search field with a Cancel text button beside it. Recents are grouped list rows; the keyboard shows a blue search key."
    >
      <ScreenBody platform="ios" clip>
        <header className="sticky top-0 z-20 border-b border-line/80 bg-cream/88 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 flex-1 items-center gap-2 rounded-[10px] bg-ink/8 px-2.5">
              <span className="text-grey">
                <Icon name="search" size={15} />
              </span>
              <span className="flex-1 text-[16px] text-grey">Search the menu</span>
              <span className="h-4.5 w-px bg-deep" aria-hidden />
            </div>
            <span className="ios-press text-[16px] text-deep">Cancel</span>
          </div>
        </header>

        <ScreenContent className="pt-4">
          <p className="px-1 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-grey">
            Recent
          </p>
          <IosGroup footnote="Recents stay on this device only.">
            {RECENT.map((r) => (
              <IosRow key={r} title={r} icon="clock" chevron />
            ))}
            <IosRow title="Clear recent searches" icon="trash" tone="danger" />
          </IosGroup>

          <p className="px-1 pb-1.5 pt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-grey">
            Popular right now
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <MobileChip key={p} platform="ios">
                {p}
              </MobileChip>
            ))}
          </div>
        </ScreenContent>
        <SoftKeyboard platform="ios" />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidSearchFocused() {
  return (
    <DeviceFrame
      platform="android"
      title="Search · focused"
      caption="Material full-screen search view: the app bar becomes the field with a back arrow and a mic. Recents are edge-to-edge rows, each with its own remove action."
    >
      <ScreenBody platform="android" clip>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-white px-2 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
          <span className="ripple flex size-11 items-center justify-center rounded-full text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </span>
          <span className="flex-1 text-[16px] text-grey">
            Search the menu
            <span className="ml-0.5 inline-block h-4.5 w-px translate-y-1 bg-deep" aria-hidden />
          </span>
          <span className="ripple flex size-11 items-center justify-center rounded-full text-ink">
            <Icon name="phone" size={20} />
          </span>
        </header>

        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {POPULAR.slice(0, 4).map((p) => (
            <MobileChip key={p} platform="android">
              {p}
            </MobileChip>
          ))}
        </div>

        <div className="flex-1">
          <p className="px-4 pb-1 text-[13px] font-bold text-deep">Recent searches</p>
          <AndroidList>
            {RECENT.map((r) => (
              <AndroidRow
                key={r}
                title={r}
                icon="clock"
                trailing={
                  <span className="ripple flex size-11 items-center justify-center rounded-full text-grey">
                    <Icon name="cross" size={16} />
                  </span>
                }
              />
            ))}
          </AndroidList>
          <div className="px-2 pt-1">
            <span className="ripple inline-flex min-h-11 items-center rounded-full px-4 text-[13px] font-bold uppercase tracking-wide text-deep">
              Clear history
            </span>
          </div>
        </div>
        <SoftKeyboard platform="android" />
      </ScreenBody>
    </DeviceFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export function IosSearchResults() {
  return (
    <DeviceFrame
      platform="ios"
      title="Search · results"
      caption="Results keep the collapsed search field, add a scope bar under it, and count the matches in a quiet line above the list."
    >
      <ScreenBody platform="ios">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-cream/88 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 flex-1 items-center gap-2 rounded-[10px] bg-ink/8 px-2.5">
              <span className="text-grey">
                <Icon name="search" size={15} />
              </span>
              <span className="flex-1 text-[16px] text-ink">yangnyeom</span>
              <span className="flex size-4.5 items-center justify-center rounded-full bg-grey/50 text-white">
                <Icon name="cross" size={11} />
              </span>
            </div>
            <span className="ios-press text-[16px] text-deep">Cancel</span>
          </div>
          <div className="pt-2">
            <IosSegmented options={["All", "Chicken", "Sets"]} active="All" label="Search scope" />
          </div>
        </header>

        <ScreenContent className="pt-3">
          <p className="num text-[13px] text-grey" aria-live="polite">
            3 items for “yangnyeom” at SS15
          </p>
          <ul className="mt-1">
            {RESULTS.map((p) => (
              <DishRow key={p.id} product={p} platform="ios" />
            ))}
          </ul>
          <p className="mt-4 text-center text-[12px] leading-snug text-grey">
            Nothing else matches. Try “spicy”, “cheese” or a category name.
          </p>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidSearchResults() {
  return (
    <DeviceFrame
      platform="android"
      title="Search · results"
      caption="The search field stays in the app bar with a clear action, and filter chips sit above the results so the count can change in place."
    >
      <ScreenBody platform="android">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-white px-2 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
          <span className="ripple flex size-11 items-center justify-center rounded-full text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </span>
          <span className="flex-1 text-[16px] font-medium text-ink">yangnyeom</span>
          <span className="ripple flex size-11 items-center justify-center rounded-full text-ink">
            <Icon name="cross" size={19} />
          </span>
        </header>

        <div className="flex gap-2 overflow-x-auto px-4 py-2.5">
          <MobileChip platform="android" active>
            All
          </MobileChip>
          <MobileChip platform="android">Chicken</MobileChip>
          <MobileChip platform="android">Sets</MobileChip>
          <MobileChip platform="android" icon="filter">
            Sort
          </MobileChip>
        </div>

        <ScreenContent className="pt-1">
          <p className="num text-[13px] text-grey" aria-live="polite">
            3 items for “yangnyeom” at SS15
          </p>
          <ul className="mt-1">
            {RESULTS.map((p) => (
              <DishRow key={p.id} product={p} platform="android" />
            ))}
          </ul>
          <p className="mt-4 text-center text-[12px] leading-snug text-grey">
            Nothing else matches. Try “spicy”, “cheese” or a category name.
          </p>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}
