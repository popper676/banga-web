"use client";

import { MOCK_ORDERS, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import {
  AndroidHeader,
  DeviceFrame,
  IosHeader,
  MobileActionBar,
} from "@/components/mobile/device";
import { MapView } from "@/components/ui/media";
import { StatusBadge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import {
  AmountBlock,
  AndroidButton,
  CountdownMeter,
  IosButton,
  MobileNotice,
  ScreenBody,
  ScreenContent,
} from "./shared";

const WAITING = MOCK_ORDERS[0];
const DELIVERING = MOCK_ORDERS.find((o) => o.status === "OUT_FOR_DELIVERY") ?? MOCK_ORDERS[2];
const BRANCH = branchById(WAITING.branchId);

const STEPS = ["Confirmed", "Preparing", "Ready", "On the way", "Delivered"];

function Timeline({ active }: { active: number }) {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span
            className={
              i < active
                ? "flex size-7 items-center justify-center rounded-full bg-deep text-white"
                : i === active
                  ? "flex size-7 items-center justify-center rounded-full border-2 border-deep bg-white"
                  : "flex size-7 items-center justify-center rounded-full border border-line bg-white text-grey"
            }
          >
            {i < active ? <Icon name="check" size={14} /> : <span className="num text-[11px]">{i + 1}</span>}
          </span>
          <span className={i <= active ? "text-[15px] font-semibold text-ink" : "text-[15px] text-grey"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function IosWaiting() {
  return (
    <DeviceFrame
      platform="ios"
      title="Waiting for the branch"
      id="confirm"
      caption="Paid, now waiting. The five-minute window and the refund promise are both on this screen."
    >
      <ScreenBody platform="ios">
        <IosHeader title="Order confirmed" />
        <ScreenContent>
          <p className="num text-[13px] font-semibold text-grey">{WAITING.code}</p>
          <h2 className="mt-1 font-display text-[24px] font-extrabold">Sending to {BRANCH.shortName}</h2>
          <div className="mt-4">
            <CountdownMeter platform="ios" label="Branch has" value="3:34" fraction={214 / 300} note="to accept, or we auto-refund" />
          </div>
          <MobileNotice tone="info" title="If nobody accepts in 5 minutes">
            The order is auto-rejected and a refund starts. Card reversals take 3–5 working days.
          </MobileNotice>
          <AmountBlock sen={WAITING.total} caption="Paid with Visa · Maybank" />
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidWaiting() {
  return (
    <DeviceFrame platform="android" title="Waiting for the branch" caption="Same SLA, Material type. Status chip instead of a large iOS title.">
      <ScreenBody platform="android">
        <AndroidHeader title="Order confirmed" />
        <ScreenContent>
          <StatusBadge status="WAITING_FOR_BRANCH" />
          <p className="num mt-2 text-[13px] text-grey">{WAITING.code}</p>
          <div className="mt-4">
            <CountdownMeter platform="android" label="Time left" value="3:34" fraction={214 / 300} />
          </div>
          <MobileNotice tone="info" title="Auto-refund if the kitchen is too busy">
            DuitNow QR refunds may need a manual transfer. We will text you the reference.
          </MobileNotice>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosRejected() {
  return (
    <DeviceFrame platform="ios" title="Rejected and refunded" id="rejected" caption="Plain reason, refund method, and a path back to the menu. No fake apology animation.">
      <ScreenBody platform="ios">
        <IosHeader title="Order declined" />
        <ScreenContent>
          <MobileNotice tone="warning" title="SS15 couldn’t take this order">
            Cheese Lover's Set is unavailable tonight. A full refund of the Visa charge is on its way — 3 to 5 working days.
          </MobileNotice>
          <AmountBlock sen={4869} caption="Refund to Visa · Maybank" />
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Order something else</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosTracking() {
  const rider = DELIVERING.delivery;
  return (
    <DeviceFrame platform="ios" title="Out for delivery" caption="Map, rider, timeline. The customer cannot cancel once the kitchen has started.">
      <ScreenBody platform="ios">
        <IosHeader title="On the way" back="Orders" />
        <ScreenContent pad={false}>
          <MapView
            className="h-44"
            label="Rider map"
            route
            pins={[
              { x: 28, y: 70, tone: "branch", name: "SS15" },
              { x: 55, y: 42, tone: "rider", name: rider?.riderName ?? "Rider" },
              { x: 78, y: 22, tone: "customer", name: "You" },
            ]}
          />
          <div className="px-4 py-4">
            <p className="num text-[13px] text-grey">{DELIVERING.code}</p>
            <p className="text-[16px] font-semibold">{rider?.riderName ?? "Ahmad Faizal"} · {rider?.riderPlate ?? "WXY 1234"}</p>
            <p className="text-[13px] text-grey">ETA {rider?.etaMinutes ?? 12} min · Yamaha NMAX</p>
            <Timeline active={3} />
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidTracking() {
  const rider = DELIVERING.delivery;
  return (
    <DeviceFrame platform="android" title="Out for delivery" caption="Same data, left-aligned Material header, no large title.">
      <ScreenBody platform="android">
        <AndroidHeader title="Live tracking" back />
        <ScreenContent pad={false}>
          <MapView
            className="h-40"
            label="Rider map"
            route
            pins={[
              { x: 28, y: 70, tone: "branch", name: "SS15" },
              { x: 55, y: 42, tone: "rider", name: rider?.riderName ?? "Rider" },
              { x: 78, y: 22, tone: "customer", name: "You" },
            ]}
          />
          <div className="px-4 py-4">
            <StatusBadge status={DELIVERING.status} />
            <p className="mt-2 text-[15px] font-semibold">{rider?.riderName ?? "Ahmad Faizal"}</p>
            <p className="num text-[13px] text-grey">{rider?.riderPlate ?? "WXY 1234"} · {money(DELIVERING.total)}</p>
            <Timeline active={3} />
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosPickupReady() {
  return (
    <DeviceFrame platform="ios" title="Pickup code" id="pickup" caption="Large pickup code, branch name, and a map pin. No rider block.">
      <ScreenBody platform="ios">
        <IosHeader title="Ready for pickup" />
        <ScreenContent className="text-center">
          <p className="text-[13px] text-grey">Show this at the SS15 counter</p>
          <p className="num mt-2 font-display text-[48px] font-extrabold tracking-[0.12em]">0138</p>
          <p className="mt-1 text-[15px] font-semibold">Soy Garlic × 2</p>
          <Timeline active={2} />
        </ScreenContent>
        <MobileActionBar>
          <IosButton tone="tinted" icon="pin">
            Directions
          </IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}
