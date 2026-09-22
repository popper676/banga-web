import type { Metadata } from "next";
import { ButtonLink, Panel } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "You're offline" };

export default function OfflinePage() {
  return (
    <div className="container-page max-w-xl py-16 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint text-deep">
        <Icon name="wifiOff" size={26} />
      </span>
      <h1 className="mt-5 text-[clamp(28px,4vw,40px)]">You're offline</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink/80">
        The last menu we saved still works, and anything already in your cart stays put. Payment,
        tracking and branch confirmation need a connection — we will never try to charge a card
        while you are offline.
      </p>
      <Panel className="mt-8 p-5 text-left">
        <p className="font-semibold">Still available</p>
        <ul className="mt-2 list-disc pl-5 text-[14px] leading-relaxed text-ink/80">
          <li>Browsing the cached menu</li>
          <li>Editing the cart</li>
          <li>Reading Our Story, locations and legal pages</li>
        </ul>
        <p className="mt-4 font-semibold">Needs a connection</p>
        <ul className="mt-2 list-disc pl-5 text-[14px] leading-relaxed text-ink/80">
          <li>Visa and DuitNow QR payment</li>
          <li>Live tracking and refunds</li>
          <li>Saving a new address</li>
        </ul>
      </Panel>
      <div className="mt-8 flex justify-center gap-2">
        <ButtonLink href="/menu" variant="secondary">
          Browse the menu
        </ButtonLink>
        <ButtonLink href="/">Try the homepage</ButtonLink>
      </div>
    </div>
  );
}
