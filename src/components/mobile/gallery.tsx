"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FrameGrid, FrameSection, MobileJumpNav, PlatformDiffNote } from "@/components/mobile/device";
import { IosSplash, AndroidSplash, IosOnboarding, AndroidOnboarding } from "@/components/mobile/screens/splash";
import {
  IosLocationPermission,
  AndroidLocationPermission,
  IosBranchSelect,
  AndroidBranchSelect,
} from "@/components/mobile/screens/location";
import { IosHome, IosHomeLiveOrder, AndroidHome, AndroidHomeLiveOrder } from "@/components/mobile/screens/home";
import { IosMenu, AndroidMenu, IosMenuFilters, AndroidMenuFilters } from "@/components/mobile/screens/menu";
import {
  IosSearchFocused,
  AndroidSearchFocused,
  IosSearchResults,
  AndroidSearchResults,
} from "@/components/mobile/screens/search";
import { IosDish, AndroidDish, IosDishMissingOption, IosDishSoldOut } from "@/components/mobile/screens/dish";
import {
  IosCart,
  AndroidCart,
  IosCartEmpty,
  IosCartUnavailable,
  IosCheckout,
  AndroidCheckout,
  IosCheckoutPickup,
} from "@/components/mobile/screens/cart";
import {
  IosPayMethods,
  AndroidPayMethods,
  IosCardEntry,
  IosCardDeclined,
  IosQrLive,
  IosQrExpired,
  AndroidQrLive,
} from "@/components/mobile/screens/payment";
import {
  IosWaiting,
  AndroidWaiting,
  IosRejected,
  IosTracking,
  AndroidTracking,
  IosPickupReady,
} from "@/components/mobile/screens/tracking";
import {
  IosAccount,
  AndroidAccount,
  IosOrders,
  IosReceipt,
  IosNotifications,
  IosOffline,
  AndroidOffline,
  IosForceUpdate,
  AndroidForceUpdate,
} from "@/components/mobile/screens/account";

const JUMP = [
  { href: "#onboarding", label: "Onboarding" },
  { href: "#branch", label: "Branch" },
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#dish", label: "Dish" },
  { href: "#cart", label: "Cart" },
  { href: "#payment", label: "Payment" },
  { href: "#confirm", label: "Tracking" },
  { href: "#account", label: "Account" },
  { href: "#system", label: "System" },
];

function pair(ios: boolean, android: boolean, a: ReactNode, b: ReactNode) {
  return (
    <FrameGrid>
      {ios ? a : null}
      {android ? b : null}
    </FrameGrid>
  );
}

export function MobileGallery({ platform }: { platform: "ios" | "android" | "both" }) {
  const ios = platform !== "android";
  const android = platform !== "ios";
  const title = platform === "ios" ? "iOS frames" : platform === "android" ? "Android frames" : "iOS and Android frames";

  return (
    <div className="bg-cream">
      <header className="border-b border-line bg-ink text-cream">
        <div className="container-page py-10 lg:py-14">
          <p className="num text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
            BANG GA BANG GA · mobile prototype
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(30px,4.6vw,54px)] font-extrabold leading-[1.05]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-cream/75">
            Designed twice. 393×852 for iPhone, 360×800 for Pixel. Chrome, sheets and feedback follow the host
            platform — these are not one layout stretched.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/mobile" className="rounded-full bg-teal px-4 py-2 text-[13px] font-bold text-ink">
              Gallery index
            </Link>
            <Link href="/mobile/ios" className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-semibold">
              iOS
            </Link>
            <Link href="/mobile/android" className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-semibold">
              Android
            </Link>
            <Link href="/mobile/flow" className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-semibold">
              Ordering flow
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page py-8">
        <MobileJumpNav items={JUMP} />

        <FrameSection id="onboarding" title="Splash and onboarding" lead="A static launch image, then three cards. Skip is always visible.">
          {pair(ios, android, <IosSplash />, <AndroidSplash />)}
          <div className="mt-10">{pair(ios, android, <IosOnboarding />, <AndroidOnboarding />)}</div>
          <PlatformDiffNote>
            iOS puts Skip top-right and a full-width Continue. Android puts Skip left, dots centre, Next right.
          </PlatformDiffNote>
        </FrameSection>

        <FrameSection id="branch" title="Location and branch" lead="The system permission, then a hand-picked branch if it is denied.">
          {pair(ios, android, <IosLocationPermission />, <AndroidLocationPermission />)}
          <div className="mt-10">{pair(ios, android, <IosBranchSelect />, <AndroidBranchSelect />)}</div>
        </FrameSection>

        <FrameSection id="home" title="Home" lead="Greeting, branch chip, promos and a live-order banner when something is cooking.">
          {pair(ios, android, <IosHome />, <AndroidHome />)}
          <div className="mt-10">{pair(ios, android, <IosHomeLiveOrder />, <AndroidHomeLiveOrder />)}</div>
        </FrameSection>

        <FrameSection id="menu" title="Menu and search" lead="Sticky category tabs, filters, search focus and results.">
          {pair(ios, android, <IosMenu />, <AndroidMenu />)}
          <div className="mt-10">{pair(ios, android, <IosMenuFilters />, <AndroidMenuFilters />)}</div>
          <div className="mt-10">{pair(ios, android, <IosSearchFocused />, <AndroidSearchFocused />)}</div>
          <div className="mt-10">{pair(ios, android, <IosSearchResults />, <AndroidSearchResults />)}</div>
        </FrameSection>

        <FrameSection id="dish" title="Dish detail" lead="Options, add-ons, quantity and a sticky add-to-cart bar.">
          {pair(ios, android, <IosDish />, <AndroidDish />)}
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosDishMissingOption />
                <IosDishSoldOut />
              </FrameGrid>
            </div>
          )}
        </FrameSection>

        <FrameSection id="cart" title="Cart and checkout" lead="Line editing, empty bag, sold-out line, then fulfilment.">
          {pair(ios, android, <IosCart />, <AndroidCart />)}
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosCartEmpty />
                <IosCartUnavailable />
              </FrameGrid>
            </div>
          )}
          <div className="mt-10">{pair(ios, android, <IosCheckout />, <AndroidCheckout />)}</div>
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosCheckoutPickup />
              </FrameGrid>
            </div>
          )}
        </FrameSection>

        <FrameSection id="payment" title="Payment" lead="Visa via Maybank and DuitNow QR via OXPay, with every failure a customer can actually hit.">
          {pair(ios, android, <IosPayMethods />, <AndroidPayMethods />)}
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosCardEntry />
                <IosCardDeclined />
              </FrameGrid>
            </div>
          )}
          <div className="mt-10">{pair(ios, android, <IosQrLive />, <AndroidQrLive />)}</div>
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosQrExpired />
              </FrameGrid>
            </div>
          )}
        </FrameSection>

        <FrameSection id="confirm" title="Confirmation and tracking" lead="The five-minute branch window, then the live timeline.">
          {pair(ios, android, <IosWaiting />, <AndroidWaiting />)}
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosRejected />
                <IosPickupReady />
              </FrameGrid>
            </div>
          )}
          <div className="mt-10">{pair(ios, android, <IosTracking />, <AndroidTracking />)}</div>
        </FrameSection>

        <FrameSection id="account" title="Orders, receipt and account">
          {pair(ios, android, <IosAccount />, <AndroidAccount />)}
          {ios && (
            <div className="mt-10">
              <FrameGrid>
                <IosOrders />
                <IosReceipt />
              </FrameGrid>
            </div>
          )}
        </FrameSection>

        <FrameSection id="system" title="Notifications and system states">
          {ios && (
            <FrameGrid>
              <IosNotifications />
              <IosOffline />
              <IosForceUpdate />
            </FrameGrid>
          )}
          {android && (
            <div className={ios ? "mt-10" : ""}>
              <FrameGrid>
                <AndroidOffline />
                <AndroidForceUpdate />
              </FrameGrid>
            </div>
          )}
        </FrameSection>
      </div>
    </div>
  );
}

export function MobileFlow() {
  return (
    <div className="bg-cream">
      <header className="border-b border-line bg-ink text-cream">
        <div className="container-page py-10 lg:py-14">
          <p className="num text-[12px] font-bold uppercase tracking-[0.18em] text-teal">Ordering flow</p>
          <h1 className="mt-2 font-display text-[clamp(30px,4.6vw,54px)] font-extrabold leading-[1.05]">
            Home to handed over
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] text-cream/75">
            Left to right, both platforms. This is the journey a reviewer walks without hunting through the gallery.
          </p>
          <Link href="/mobile" className="mt-6 inline-flex rounded-full bg-teal px-4 py-2 text-[13px] font-bold text-ink">
            Back to gallery index
          </Link>
        </div>
      </header>
      <div className="container-page space-y-16 py-10">
        <section>
          <h2 className="mb-6">iOS</h2>
          <FrameGrid>
            <IosHome />
            <IosMenu />
            <IosDish />
            <IosCart />
            <IosCheckout />
            <IosPayMethods />
            <IosWaiting />
            <IosTracking />
          </FrameGrid>
        </section>
        <section>
          <h2 className="mb-6">Android</h2>
          <FrameGrid>
            <AndroidHome />
            <AndroidMenu />
            <AndroidDish />
            <AndroidCart />
            <AndroidCheckout />
            <AndroidPayMethods />
            <AndroidWaiting />
            <AndroidTracking />
          </FrameGrid>
        </section>
      </div>
    </div>
  );
}
