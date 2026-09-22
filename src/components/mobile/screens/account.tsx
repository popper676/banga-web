"use client";

import { MOCK_ORDERS, MOCK_USER, SAVED_ADDRESSES } from "@/lib/mock-data";
import { money } from "@/lib/format";
import {
  AndroidHeader,
  AndroidNavBar,
  DeviceFrame,
  IosHeader,
  IosTabBar,
  Snackbar,
  tabsWith,
} from "@/components/mobile/device";
import { StatusBadge } from "@/components/ui/primitives";
import { Avatar } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import {
  AndroidButton,
  AndroidSwitch,
  IosButton,
  IosRow,
  IosSwitch,
  ScreenBody,
  ScreenContent,
} from "./shared";

export function IosAccount() {
  return (
    <DeviceFrame platform="ios" title="Account" caption="Grouped inset list, large title, chevrons. Saved cards show the brand and last four only.">
      <ScreenBody platform="ios">
        <IosHeader title="Account" large />
        <ScreenContent>
          <div className="flex items-center gap-3">
            <Avatar name={MOCK_USER.name} size={52} />
            <div>
              <p className="text-[17px] font-semibold">{MOCK_USER.name}</p>
              <p className="text-[13px] text-grey">{MOCK_USER.email}</p>
            </div>
          </div>
          <ul className="mt-5 overflow-hidden rounded-[12px] bg-white">
            <IosRow title="Orders" value="34" chevron />
            <IosRow title="Addresses" value={`${SAVED_ADDRESSES.length}`} chevron />
            <IosRow title="Visa" value="•••• 4242" chevron />
          </ul>
          <ul className="mt-3 overflow-hidden rounded-[12px] bg-white">
            <IosRow title="Notifications" chevron />
            <IosRow title="Halal & allergens" chevron />
          </ul>
        </ScreenContent>
        <IosTabBar items={tabsWith("Account")} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidAccount() {
  return (
    <DeviceFrame platform="android" title="Account" caption="Left-aligned header, 16dp rows, no grouped cards. Switch uses the Material track.">
      <ScreenBody platform="android">
        <AndroidHeader title="Account" />
        <ScreenContent>
          <div className="flex items-center gap-3">
            <Avatar name={MOCK_USER.name} size={48} />
            <div>
              <p className="text-[16px] font-semibold">{MOCK_USER.name}</p>
              <p className="text-[13px] text-grey">{MOCK_USER.email}</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-line rounded-[12px] border border-line bg-white">
            {["Orders", "Addresses", "Payments", "Notifications"].map((l) => (
              <div key={l} className="flex h-12 items-center justify-between px-3 text-[15px]">
                {l}
                <Icon name="chevronRight" size={16} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[15px] font-medium">Order updates</span>
            <AndroidSwitch on label="Order updates" />
          </div>
        </ScreenContent>
        <AndroidNavBar items={tabsWith("Account")} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosOrders() {
  return (
    <DeviceFrame platform="ios" title="Order history" id="account" caption="Active order pinned, past orders below with reorder.">
      <ScreenBody platform="ios">
        <IosHeader title="Orders" large />
        <ScreenContent>
          <ul className="flex flex-col gap-3">
            {MOCK_ORDERS.slice(0, 4).map((o) => (
              <li key={o.id} className="rounded-[14px] border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="num text-[13px] font-semibold">{o.code}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-[14px]">{o.lines[0]?.name}</p>
                <p className="num mt-1 text-[13px] font-bold">{money(o.total)}</p>
              </li>
            ))}
          </ul>
        </ScreenContent>
        <IosTabBar items={tabsWith("Orders")} />
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosReceipt() {
  const o = MOCK_ORDERS[0];
  return (
    <DeviceFrame platform="ios" title="Receipt sheet" caption="Itemised receipt in a sheet. SST and the Maybank reference are both present.">
      <ScreenBody platform="ios">
        <IosHeader title="Receipt" back="Orders" />
        <ScreenContent>
          <p className="num text-[13px] text-grey">{o.code}</p>
          <p className="font-display text-[22px] font-extrabold">BANG GA BANG GA</p>
          <ul className="mt-4 flex flex-col gap-1 text-[14px]">
            {o.lines.map((l) => (
              <li key={l.lineId} className="flex justify-between">
                <span>
                  {l.quantity}× {l.name}
                </span>
                <span className="num">{money(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="num">{money(o.total)}</span>
          </p>
          <p className="mt-2 text-[12px] text-grey">Visa · Maybank · {o.payment.reference}</p>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosNotifications() {
  return (
    <DeviceFrame platform="ios" title="Notification permission" id="system" caption="iOS system alert on top of a settings list. Order updates cannot be turned off.">
      <ScreenBody platform="ios" clip>
        <IosHeader title="Notifications" back="Account" />
        <ScreenContent>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-medium">Order updates</p>
              <p className="mt-1 text-[12px] text-grey">Required so we can tell you if the branch rejects an order.</p>
            </div>
            <IosSwitch on label="Order updates" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium">Promotions</p>
            <IosSwitch on={false} label="Promotions" />
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosOffline() {
  return (
    <DeviceFrame platform="ios" title="Offline" caption="Cached menu still readable. Checkout is blocked until the radio comes back.">
      <ScreenBody platform="ios">
        <IosHeader title="Menu" />
        <ScreenContent className="pt-10 text-center">
          <Icon name="wifiOff" size={32} />
          <p className="mt-3 font-display text-[22px] font-bold">You’re offline</p>
          <p className="mt-1 text-[14px] text-grey">You can still browse. Payment needs a connection.</p>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidOffline() {
  return (
    <DeviceFrame platform="android" title="Offline snackbar" caption="Material snackbar at the bottom rather than an interstitial. The screen behind stays put.">
      <ScreenBody platform="android" clip>
        <AndroidHeader title="Menu" />
        <ScreenContent>
          <p className="text-[15px] text-grey">Signature chicken still listed from cache.</p>
        </ScreenContent>
        <div className="absolute inset-x-0 bottom-4">
          <Snackbar text="You’re offline. Payment is paused." action="Retry" />
        </div>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosForceUpdate() {
  return (
    <DeviceFrame platform="ios" title="Force update" caption="Blocking screen when the store build is behind a payment-schema change.">
      <ScreenBody platform="ios">
        <ScreenContent className="flex flex-col items-center justify-center pt-24 text-center">
          <p className="font-display text-[26px] font-extrabold">Update required</p>
          <p className="mt-2 max-w-[260px] text-[15px] text-grey">
            This version cannot show DuitNow QR correctly. Update from the App Store to keep ordering.
          </p>
          <div className="mt-6 w-full">
            <IosButton>Update</IosButton>
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidForceUpdate() {
  return (
    <DeviceFrame platform="android" title="Force update" caption="Play Store wording, filled Material button, no iOS-style large title tracking.">
      <ScreenBody platform="android">
        <ScreenContent className="flex flex-col pt-20">
          <p className="text-[22px] font-bold">Update the app</p>
          <p className="mt-2 text-[15px] text-grey">A payment change needs a newer build from Google Play.</p>
          <div className="mt-6">
            <AndroidButton>Open Play Store</AndroidButton>
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}
