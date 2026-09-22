"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon, type IconKey } from "@/components/ui/icons";

export type Platform = "ios" | "android";

/** Physical frames requested in the brief. */
export const DEVICE = {
  ios: { w: 393, h: 852, label: "iPhone 15 · 393 × 852", radius: 44 },
  android: { w: 360, h: 800, label: "Pixel 8 · 360 × 800", radius: 32 },
} as const;

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

export function DeviceFrame({
  platform,
  title,
  caption,
  children,
  bg = "bg-cream",
  id,
}: {
  platform: Platform;
  title: string;
  caption?: string;
  children: ReactNode;
  bg?: string;
  id?: string;
}) {
  const d = DEVICE[platform];
  return (
    <figure id={id} className="flex w-full flex-col items-center gap-3">
      <figcaption className="text-center">
        <p className="font-display text-[15px] font-bold text-ink">{title}</p>
        <p className="num text-[11px] text-grey">
          {platform === "ios" ? "iOS" : "Android"} · {d.label}
        </p>
        {caption && <p className="mx-auto mt-1 max-w-[340px] text-[12px] leading-snug text-grey">{caption}</p>}
      </figcaption>

      <div
        className={cn(
          "relative shrink-0 border-ink/90 bg-ink shadow-[0_18px_44px_rgba(0,0,0,0.22)]",
          platform === "ios" ? "border-[10px]" : "border-[8px]",
        )}
        style={{
          width: d.w + (platform === "ios" ? 20 : 16),
          borderRadius: d.radius + 10,
        }}
      >
        <div
          className={cn("relative overflow-hidden", bg)}
          style={{ width: d.w, height: d.h, borderRadius: d.radius }}
        >
          {platform === "ios" ? <IosStatusBar /> : <AndroidStatusBar />}

          <div
            className="relative overflow-y-auto overscroll-contain"
            style={{ height: d.h - (platform === "ios" ? 47 : 28) }}
          >
            {children}
          </div>

          {platform === "ios" && (
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-ink/35" />
          )}
        </div>
      </div>
    </figure>
  );
}

function IosStatusBar() {
  return (
    <div className="relative flex h-[47px] shrink-0 items-end justify-between px-7 pb-1.5 text-ink">
      <span className="num text-[14px] font-semibold tracking-tight">9:41</span>
      <span className="absolute left-1/2 top-2 h-[26px] w-[105px] -translate-x-1/2 rounded-full bg-ink" />
      <span className="flex items-center gap-1" aria-hidden>
        <SignalBars />
        <WifiGlyph />
        <BatteryGlyph />
      </span>
    </div>
  );
}

function AndroidStatusBar() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between px-4 text-ink">
      <span className="num text-[12px] font-semibold">9:41</span>
      <span className="flex items-center gap-1" aria-hidden>
        <SignalBars small />
        <WifiGlyph small />
        <BatteryGlyph small />
      </span>
    </div>
  );
}

function SignalBars({ small }: { small?: boolean }) {
  const h = small ? 8 : 10;
  return (
    <svg width={h * 1.6} height={h} viewBox="0 0 16 10" fill="currentColor">
      <rect x="0" y="7" width="2.6" height="3" rx="0.8" />
      <rect x="4.4" y="5" width="2.6" height="5" rx="0.8" />
      <rect x="8.8" y="2.6" width="2.6" height="7.4" rx="0.8" />
      <rect x="13.2" y="0" width="2.6" height="10" rx="0.8" />
    </svg>
  );
}

function WifiGlyph({ small }: { small?: boolean }) {
  const s = small ? 11 : 13;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 19.5a1.9 1.9 0 100-3.8 1.9 1.9 0 000 3.8zM5.5 12.4a9.2 9.2 0 0113 0l1.7-1.8a11.7 11.7 0 00-16.4 0zM8.4 15.3a5.3 5.3 0 017.2 0l1.7-1.8a7.8 7.8 0 00-10.6 0z" />
    </svg>
  );
}

function BatteryGlyph({ small }: { small?: boolean }) {
  const w = small ? 18 : 22;
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 26 13" fill="none">
      <rect x="0.7" y="0.7" width="21" height="11.6" rx="3.2" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2.4" y="2.4" width="15" height="8.2" rx="2" fill="currentColor" />
      <path d="M23.6 4.4v4.2a2.2 2.2 0 000-4.2z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Platform chrome                                                     */
/* ------------------------------------------------------------------ */

/** iOS: centred title, back chevron with label, blurred large surface. */
export function IosHeader({
  title,
  back,
  large,
  trailing,
}: {
  title: string;
  back?: string;
  large?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-cream/88 backdrop-blur">
      <div className="flex h-11 items-center justify-between px-2">
        <span className="flex min-w-16 items-center">
          {back && (
            <span className="flex items-center text-[16px] font-normal text-deep">
              <Icon name="chevronLeft" size={20} />
              <span className="-ml-0.5">{back}</span>
            </span>
          )}
        </span>
        {!large && <span className="text-[16px] font-semibold text-ink">{title}</span>}
        <span className="flex min-w-16 justify-end pr-1">{trailing}</span>
      </div>
      {large && (
        <div className="px-4 pb-2">
          <h1 className="font-display text-[30px] font-extrabold leading-tight text-ink">{title}</h1>
        </div>
      )}
    </header>
  );
}

/** Android: left-aligned title, back arrow, no centring. */
export function AndroidHeader({
  title,
  back,
  trailing,
}: {
  title: string;
  back?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-cream px-2 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
      {back && (
        <span className="flex size-10 items-center justify-center rounded-full text-ink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </span>
      )}
      <h1 className={cn("flex-1 truncate text-[20px] font-semibold text-ink", !back && "pl-2")}>
        {title}
      </h1>
      {trailing}
    </header>
  );
}

export interface TabItem {
  icon: IconKey;
  label: string;
  active?: boolean;
  badge?: number;
}

export const MOBILE_TABS: TabItem[] = [
  { icon: "home", label: "Home" },
  { icon: "list", label: "Menu" },
  { icon: "cart", label: "Cart" },
  { icon: "receipt", label: "Orders" },
  { icon: "user", label: "Account" },
];

export function tabsWith(active: string, cartBadge?: number): TabItem[] {
  return MOBILE_TABS.map((t) => ({
    ...t,
    active: t.label === active,
    badge: t.label === "Cart" ? cartBadge : undefined,
  }));
}

/** iOS tab bar: icon above label, hairline top border, translucent. */
export function IosTabBar({ items }: { items: TabItem[] }) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-20 border-t border-line/80 bg-cream/92 pb-5 backdrop-blur"
    >
      <ul className="flex">
        {items.map((t) => (
          <li key={t.label} className="flex-1">
            <span
              className={cn(
                "relative flex flex-col items-center gap-0.5 pt-2 text-[10px] font-medium",
                t.active ? "text-deep" : "text-grey",
              )}
            >
              <Icon name={t.icon} size={23} />
              {t.label}
              {t.badge ? <TabBadge n={t.badge} /> : null}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Android: Material bottom navigation with an active pill behind the icon. */
export function AndroidNavBar({ items }: { items: TabItem[] }) {
  return (
    <nav aria-label="Main" className="sticky bottom-0 z-20 bg-cream pb-2 pt-1.5 shadow-[0_-1px_0_rgba(0,0,0,0.1)]">
      <ul className="flex">
        {items.map((t) => (
          <li key={t.label} className="flex-1">
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "relative flex h-8 w-16 items-center justify-center rounded-full",
                  t.active ? "bg-mint text-deep" : "text-grey",
                )}
              >
                <Icon name={t.icon} size={21} />
                {t.badge ? <TabBadge n={t.badge} /> : null}
              </span>
              <span className={cn("text-[11px]", t.active ? "font-bold text-ink" : "text-grey")}>
                {t.label}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-ink/30" aria-hidden />
    </nav>
  );
}

function TabBadge({ n }: { n: number }) {
  return (
    <span className="num absolute -right-1.5 top-0 min-w-4 rounded-full bg-cta px-1 text-center text-[10px] font-bold leading-4 text-white">
      {n}
    </span>
  );
}

/** Fixed bottom action area (Add to cart, Pay, Confirm…). */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-white px-4 pb-6 pt-3">{children}</div>
  );
}

/** Android-only: Material snackbar. iOS uses a banner instead. */
export function Snackbar({ text, action }: { text: string; action?: string }) {
  return (
    <div className="mx-3 flex items-center gap-3 rounded-[6px] bg-ink px-4 py-3 text-cream shadow-lg">
      <span className="flex-1 text-[14px]">{text}</span>
      {action && <span className="text-[14px] font-bold uppercase text-teal">{action}</span>}
    </div>
  );
}

/** iOS-only: sheet handle used on modal sheets. */
export function SheetHandle() {
  return <div className="mx-auto my-2.5 h-1.5 w-10 rounded-full bg-ink/20" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Gallery scaffolding for the /mobile prototype pages                 */
/* ------------------------------------------------------------------ */

export function FrameGrid({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-14 lg:justify-start">
      {children}
    </div>
  );
}

export function FrameSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-8">
      <h2 className="text-[clamp(20px,2.4vw,26px)]">{title}</h2>
      {lead && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-grey">{lead}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

export function PlatformDiffNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-[12px] border border-line bg-white px-3 py-2.5 text-[13px] leading-snug text-ink/80">
      <span className="mt-0.5 shrink-0 text-deep">
        <Icon name="sparkle" size={15} />
      </span>
      {children}
    </p>
  );
}

export function MobileJumpNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Mobile screen sections" className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink hover:bg-mint"
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
