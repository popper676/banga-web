"use client";

import { MOCK_ORDERS, productById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import {
  AndroidHeader,
  AndroidNavBar,
  DeviceFrame,
  IosHeader,
  IosTabBar,
  MobileActionBar,
  tabsWith,
} from "@/components/mobile/device";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  AndroidButton,
  AndroidTabs,
  IosButton,
  IosSegmented,
  PlatformStepper,
  ScreenBody,
  ScreenContent,
  TotalRow,
} from "./shared";

const SOY = productById("p-soy")!;
const TTEOK = productById("p-tteokbokki") ?? productById("p-yangnyeom")!;
const LIVE = MOCK_ORDERS[0];

function CartLines({ unavailable }: { unavailable?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      <li className="flex gap-3">
        <FoodImage src={SOY.image} alt={SOY.name} className="size-16 shrink-0 rounded-[10px]" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{SOY.name}</p>
          <p className="text-[12px] text-grey">Regular · Soy garlic</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="num text-[14px] font-bold">{money(SOY.price)}</span>
            <PlatformStepper platform="ios" quantity={1} />
          </div>
        </div>
      </li>
      <li className="flex gap-3">
        <FoodImage src={TTEOK.image} alt={TTEOK.name} className="size-16 shrink-0 rounded-[10px]" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{TTEOK.name}</p>
          <p className="text-[12px] text-grey">{unavailable ? "Sold out at SS15" : "Regular"}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="num text-[14px] font-bold">{money(TTEOK.price)}</span>
            {unavailable ? (
              <span className="text-[12px] font-semibold text-cta">Remove</span>
            ) : (
              <PlatformStepper platform="ios" quantity={1} />
            )}
          </div>
        </div>
      </li>
    </ul>
  );
}

function Totals() {
  return (
    <div className="mt-4 rounded-[14px] border border-line bg-white px-3 py-2">
      <TotalRow label="Subtotal" value={money(LIVE.subtotal)} />
      <TotalRow label="SST 6%" value={money(LIVE.tax)} />
      <TotalRow label="Delivery" value={money(LIVE.deliveryFee)} />
      <TotalRow label="To pay" value={money(LIVE.total)} strong />
    </div>
  );
}

export function IosCart() {
  return (
    <DeviceFrame platform="ios" title="Cart" caption="Line editing, promo field and a sticky checkout bar. The amount owed never leaves the screen.">
      <ScreenBody platform="ios">
        <IosHeader title="Cart" large />
        <ScreenContent>
          <CartLines />
          <Totals />
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Checkout · {money(LIVE.total)}</IosButton>
        </MobileActionBar>
        <IosTabBar items={tabsWith("Cart", 2)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidCart() {
  return (
    <DeviceFrame platform="android" title="Cart" caption="Material bottom nav with a cart badge. Checkout is a filled FAB-width button, not a pill.">
      <ScreenBody platform="android">
        <AndroidHeader title="Cart" />
        <ScreenContent>
          <CartLines />
          <Totals />
        </ScreenContent>
        <MobileActionBar>
          <AndroidButton>Checkout · {money(LIVE.total)}</AndroidButton>
        </MobileActionBar>
        <AndroidNavBar items={tabsWith("Cart", 2)} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosCartEmpty() {
  return (
    <DeviceFrame platform="ios" title="Empty cart" id="cart-empty" caption="A reason to browse, not a blank white screen.">
      <ScreenBody platform="ios">
        <IosHeader title="Cart" large />
        <ScreenContent className="flex flex-col items-center justify-center pt-16 text-center">
          <span className="text-deep">
            <Icon name="bag" size={36} />
          </span>
          <p className="mt-3 font-display text-[22px] font-bold">Your bag is empty</p>
          <p className="mt-1 max-w-[240px] text-[14px] text-grey">Soy garlic boneless is the usual first order.</p>
          <div className="mt-6 w-full">
            <IosButton>Browse the menu</IosButton>
          </div>
        </ScreenContent>
        <IosTabBar items={tabsWith("Cart")} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosCartUnavailable() {
  return (
    <DeviceFrame
      platform="ios"
      title="Unavailable line"
      id="cart-unavailable"
      caption="A sold-out line stays visible with a remove action so the rest of the bag can still check out."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Cart" large />
        <ScreenContent>
          <CartLines unavailable />
          <Totals />
        </ScreenContent>
        <MobileActionBar>
          <IosButton tone="plain">Remove unavailable item to continue</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

function CheckoutFields({ platform }: { platform: "ios" | "android" }) {
  return (
    <ScreenContent>
      {platform === "ios" ? (
          <IosSegmented options={["Delivery", "Pickup"]} active="Delivery" label="Fulfilment" />
      ) : (
          <AndroidTabs options={["Delivery", "Pickup"]} active="Delivery" label="Fulfilment" />
      )}
      <div className="mt-4 rounded-[14px] border border-line bg-white p-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-grey">Deliver to</p>
        <p className="mt-1 text-[15px] font-semibold">12, Jalan SS15/4D</p>
        <p className="text-[13px] text-grey">SS15, 47500 Subang Jaya · 2.3 km</p>
      </div>
      <div className="mt-3 rounded-[14px] border border-line bg-white p-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-grey">Contact</p>
        <p className="mt-1 text-[15px] font-semibold">Aisyah Rahman</p>
        <p className="num text-[13px] text-grey">+60 12-345 6789</p>
      </div>
      <Totals />
    </ScreenContent>
  );
}

export function IosCheckout() {
  return (
    <DeviceFrame platform="ios" title="Checkout · delivery" caption="Fulfilment segmented control, address, contact, then pay. Pickup would swap the address for a branch card.">
      <ScreenBody platform="ios">
        <IosHeader title="Checkout" back="Cart" />
        <CheckoutFields platform="ios" />
        <MobileActionBar>
          <IosButton>Continue to payment · {money(LIVE.total)}</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidCheckout() {
  return (
    <DeviceFrame platform="android" title="Checkout · delivery" caption="Android tabs instead of iOS segmented control. Same fields, denser type.">
      <ScreenBody platform="android">
        <AndroidHeader title="Checkout" back />
        <CheckoutFields platform="android" />
        <MobileActionBar>
          <AndroidButton>Pay {money(LIVE.total)}</AndroidButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosCheckoutPickup() {
  return (
    <DeviceFrame platform="ios" title="Checkout · pickup" id="checkout-pickup" caption="Pickup drops the delivery fee and shows the branch, not an address form.">
      <ScreenBody platform="ios">
        <IosHeader title="Checkout" back="Cart" />
        <ScreenContent>
          <IosSegmented options={["Delivery", "Pickup"]} active="Pickup" label="Fulfilment" />
          <div className="mt-4 rounded-[14px] border border-line bg-white p-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-grey">Collect from</p>
            <p className="mt-1 text-[15px] font-semibold">SS15, Subang Jaya</p>
            <p className="text-[13px] text-grey">Ready in about 18 minutes · show this code at the counter</p>
          </div>
          <div className="mt-3 rounded-[14px] border border-line bg-white px-3 py-2">
            <TotalRow label="Subtotal" value={money(LIVE.subtotal)} />
            <TotalRow label="SST 6%" value={money(LIVE.tax)} />
            <TotalRow label="To pay" value={money(LIVE.total - LIVE.deliveryFee)} strong />
          </div>
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Continue to payment</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}
