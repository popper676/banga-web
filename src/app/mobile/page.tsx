import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile gallery",
  description:
    "Entry point for the iOS and Android prototype frames. 393×852 and 360×800, designed twice.",
};

const CARDS = [
  {
    href: "/mobile/ios",
    title: "iOS frames",
    body: "Every iPhone screen at 393×852, with the Dynamic Island, tab bar and sheet chrome.",
  },
  {
    href: "/mobile/android",
    title: "Android frames",
    body: "Every Pixel screen at 360×800, with Material navigation, snackbars and 48dp targets.",
  },
  {
    href: "/mobile/flow",
    title: "Ordering flow",
    body: "Home → menu → dish → cart → pay → confirm → tracking, laid out left to right for both platforms.",
  },
];

export default function MobileIndexPage() {
  return (
    <div className="bg-cream">
      <header className="border-b border-line bg-ink text-cream">
        <div className="container-page py-12 lg:py-16">
          <p className="num text-[12px] font-bold uppercase tracking-[0.18em] text-teal">Two platforms</p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            Native-feeling apps, one kitchen.
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-cream/75">
            These are designed frames, not a running Expo build yet. Tap through them as a reviewer would:
            the chrome, the sheets and the payment states all follow iOS or Android rather than a shared
            web skin.
          </p>
        </div>
      </header>
      <div className="container-page grid gap-4 py-10 md:grid-cols-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-[16px] border border-line bg-white p-5 hover:bg-mint/50"
          >
            <h2 className="text-[18px]">{c.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-grey">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
