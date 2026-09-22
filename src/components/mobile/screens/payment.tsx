"use client";

import { MOCK_ORDERS } from "@/lib/mock-data";
import { money } from "@/lib/format";
import {
  AndroidHeader,
  DeviceFrame,
  IosHeader,
  MobileActionBar,
} from "@/components/mobile/device";
import { QRCode } from "@/components/ui/media";
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

const LIVE = MOCK_ORDERS[0];

export function IosPayMethods() {
  return (
    <DeviceFrame platform="ios" title="Payment · methods" caption="Two methods only. Visa via Maybank and DuitNow QR via OXPay sit as equal choices; provider names stay secondary.">
      <ScreenBody platform="ios">
        <IosHeader title="Payment" back="Checkout" />
        <ScreenContent>
          <AmountBlock sen={LIVE.total} caption="Amount due" />
          <button type="button" className="mt-4 flex w-full items-center gap-3 rounded-[14px] border-2 border-ink bg-white p-3 text-left">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-mint text-deep">
              <Icon name="card" size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold">Visa</span>
              <span className="block text-[12px] text-grey">Processed securely by Maybank</span>
            </span>
            <Icon name="check" size={16} />
          </button>
          <button type="button" className="mt-2 flex w-full items-center gap-3 rounded-[14px] border border-line bg-white p-3 text-left">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-cream text-deep">
              <Icon name="qr" size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold">DuitNow QR</span>
              <span className="block text-[12px] text-grey">Powered by OXPay</span>
            </span>
          </button>
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Pay {money(LIVE.total)}</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidPayMethods() {
  return (
    <DeviceFrame platform="android" title="Payment · methods" caption="Same two methods. Android uses a radio-row with a 48dp target instead of an iOS checkmark.">
      <ScreenBody platform="android">
        <AndroidHeader title="Payment" back />
        <ScreenContent>
          <AmountBlock sen={LIVE.total} caption="Amount due" />
          <div className="mt-4 overflow-hidden rounded-[12px] border border-line bg-white">
            <div className="flex items-center gap-3 p-3">
              <span className="size-5 rounded-full border-[6px] border-deep" />
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">Visa</span>
                <span className="block text-[12px] text-grey">Maybank</span>
              </span>
              <Icon name="card" size={18} />
            </div>
            <div className="flex items-center gap-3 border-t border-line p-3">
              <span className="size-5 rounded-full border border-grey" />
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">DuitNow QR</span>
                <span className="block text-[12px] text-grey">OXPay</span>
              </span>
              <Icon name="qr" size={18} />
            </div>
          </div>
        </ScreenContent>
        <MobileActionBar>
          <AndroidButton>Pay {money(LIVE.total)}</AndroidButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosCardEntry() {
  return (
    <DeviceFrame platform="ios" title="Card entry" id="pay-card" caption="Card number, expiry, CVC. Nothing is stored. Maybank is named once, in secondary type.">
      <ScreenBody platform="ios">
        <IosHeader title="Visa" back="Methods" />
        <ScreenContent>
          <AmountBlock sen={LIVE.total} caption="Charged to Visa" />
          <label className="mt-4 block text-[13px] font-semibold">Card number</label>
          <div className="mt-1 flex h-12 items-center rounded-[12px] border border-line bg-white px-3 num text-[16px]">
            4242 4242 4242 4242
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold">Expiry</label>
              <div className="mt-1 flex h-12 items-center rounded-[12px] border border-line bg-white px-3 num">09 / 28</div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold">CVC</label>
              <div className="mt-1 flex h-12 items-center rounded-[12px] border border-line bg-white px-3 num">•••</div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-grey">Processed securely by Maybank. Card details never sit in this app.</p>
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Pay {money(LIVE.total)}</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosCardDeclined() {
  return (
    <DeviceFrame platform="ios" title="Card declined" id="pay-declined" caption="Bank response in plain language. Retry is the only action — the order is not created.">
      <ScreenBody platform="ios">
        <IosHeader title="Visa" back="Methods" />
        <ScreenContent className="pt-8">
          <MobileNotice tone="danger" title="The bank declined this card">
            Insufficient funds (51). Nothing was charged. Try another Visa or switch to DuitNow QR.
          </MobileNotice>
          <div className="mt-4">
            <AmountBlock sen={LIVE.total} caption="Still due" />
          </div>
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Try again</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosQrLive() {
  return (
    <DeviceFrame platform="ios" title="DuitNow QR live" id="pay-qr" caption="Dynamic QR with a countdown. OXPay is named once. This pattern is not a payable code.">
      <ScreenBody platform="ios">
        <IosHeader title="DuitNow QR" back="Methods" />
        <ScreenContent className="flex flex-col items-center">
          <AmountBlock sen={LIVE.total} caption="Scan to pay" />
          <div className="mt-4">
            <QRCode seed="BG-260921-0138" size={180} />
          </div>
          <p className="mt-3 text-[12px] text-grey">DuitNow QR powered by OXPay</p>
          <div className="mt-4 w-full">
            <CountdownMeter platform="ios" label="QR expires in" value="8:02" fraction={482 / 600} note="A new code gets a new reference" />
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function IosQrExpired() {
  return (
    <DeviceFrame platform="ios" title="QR expired" id="pay-expired" caption="Expired QR is dimmed. Generating a new one creates a new reference so the customer cannot be charged twice.">
      <ScreenBody platform="ios">
        <IosHeader title="DuitNow QR" back="Methods" />
        <ScreenContent className="flex flex-col items-center">
          <QRCode seed="BG-260921-0138-old" size={160} dimmed />
          <MobileNotice tone="warning" title="This QR has expired">
            No money moved. Generate a new code — the old reference cannot be reused.
          </MobileNotice>
        </ScreenContent>
        <MobileActionBar>
          <IosButton>Generate a new QR</IosButton>
        </MobileActionBar>
      </ScreenBody>
    </DeviceFrame>
  );
}

export function AndroidQrLive() {
  return (
    <DeviceFrame platform="android" title="DuitNow QR live" caption="Same QR, Material caption type, 48dp generate action when it expires.">
      <ScreenBody platform="android">
        <AndroidHeader title="DuitNow QR" back />
        <ScreenContent className="flex flex-col items-center">
          <AmountBlock sen={LIVE.total} caption="Scan with any DuitNow app" />
          <div className="mt-4">
            <QRCode seed="BG-260921-0138-and" size={168} />
          </div>
          <p className="mt-3 text-[12px] text-grey">Powered by OXPay</p>
          <div className="mt-4 w-full">
            <CountdownMeter platform="android" label="Expires in" value="8:02" fraction={482 / 600} />
          </div>
        </ScreenContent>
      </ScreenBody>
    </DeviceFrame>
  );
}
