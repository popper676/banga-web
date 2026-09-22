"use client";

/**
 * Shared building blocks for the mobile screen designs.
 *
 * These are deliberately platform-aware: every helper either takes a
 * `platform` prop or exists in an `Ios*` / `Android*` pair, so the two
 * galleries can differ in chrome, controls and affordances rather than in
 * content. Nothing here is interactive beyond a little local state — each
 * frame renders one designed state.
 */

import type { ReactNode } from "react";
import { cn, money } from "@/lib/format";
import type { Branch } from "@/lib/types";
import { Icon, type IconKey } from "@/components/ui/icons";
import type { Platform } from "@/components/mobile/device";

/* ------------------------------------------------------------------ */
/* Screen scaffolding                                                  */
/* ------------------------------------------------------------------ */

/**
 * Fills the device viewport so sticky action bars and tab bars sit on the
 * bottom edge even when the content is short. iOS gets tighter tracking to
 * imitate SF Pro.
 */
export function ScreenBody({
  platform,
  children,
  clip,
  className,
}: {
  platform: Platform;
  children: ReactNode;
  /** Use for frames with a dialog, sheet or action sheet on top. */
  clip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col",
        clip ? "h-full overflow-hidden" : "min-h-full",
        platform === "ios" ? "tracking-[-0.011em]" : "tracking-normal",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The scrolling content region between the app bar and the bottom chrome. */
export function ScreenContent({
  children,
  className,
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={cn("flex-1", pad && "px-4 pb-5 pt-4", className)}>{children}</div>
  );
}

/** Small all-caps label above a block of content. */
export function GroupLabel({
  children,
  platform,
  className,
}: {
  children: ReactNode;
  platform: Platform;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-sans",
        platform === "ios"
          ? "px-1 pb-1.5 pt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-grey"
          : "pb-2 pt-1 text-[13px] font-bold text-deep",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** Non-heading section label, for places where a heading would break order. */
export function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[12px] font-semibold uppercase tracking-[0.06em] text-grey", className)}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

/** iOS inset grouped list: rounded card, hairline separators, chevrons. */
export function IosGroup({
  children,
  footnote,
  className,
}: {
  children: ReactNode;
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <ul className="overflow-hidden rounded-[12px] border border-line bg-white">{children}</ul>
      {footnote && (
        <p className="px-1 pt-1.5 text-[12px] leading-snug text-grey">{footnote}</p>
      )}
    </div>
  );
}

export function IosRow({
  title,
  sub,
  icon,
  value,
  chevron,
  trailing,
  tone = "default",
}: {
  title: ReactNode;
  sub?: ReactNode;
  icon?: IconKey;
  value?: ReactNode;
  chevron?: boolean;
  trailing?: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <li className="border-b border-line/70 last:border-0">
      <div className="ios-press flex min-h-11 items-center gap-3 px-3.5 py-2.5">
        {icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-[8px]",
              tone === "danger" ? "bg-cta/10 text-cta" : "bg-mint text-deep",
            )}
          >
            <Icon name={icon} size={16} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[15px] font-medium",
              tone === "danger" ? "text-cta" : "text-ink",
            )}
          >
            {title}
          </span>
          {sub && <span className="mt-0.5 block text-[12px] leading-snug text-grey">{sub}</span>}
        </span>
        {value && <span className="num shrink-0 text-[14px] text-grey">{value}</span>}
        {trailing}
        {chevron && (
          <span className="shrink-0 text-grey/70" aria-hidden>
            <Icon name="chevronRight" size={16} />
          </span>
        )}
      </div>
    </li>
  );
}

/** Android list: edge-to-edge rows on the surface, ripple, no card inset. */
export function AndroidList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={cn("flex flex-col border-y border-line/70 bg-white", className)}>{children}</ul>
  );
}

export function AndroidRow({
  title,
  sub,
  icon,
  value,
  trailing,
  tone = "default",
}: {
  title: ReactNode;
  sub?: ReactNode;
  icon?: IconKey;
  value?: ReactNode;
  trailing?: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <li className="border-b border-line/60 last:border-0">
      <div className="ripple flex min-h-14 items-center gap-4 px-4 py-2.5">
        {icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              tone === "danger" ? "bg-cta/10 text-cta" : "bg-mint text-deep",
            )}
          >
            <Icon name={icon} size={18} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[15px] font-medium",
              tone === "danger" ? "text-cta" : "text-ink",
            )}
          >
            {title}
          </span>
          {sub && <span className="mt-0.5 block text-[12px] leading-snug text-grey">{sub}</span>}
        </span>
        {value && <span className="num shrink-0 text-[14px] text-grey">{value}</span>}
        {trailing}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

/** iOS prominent button: rounded rectangle, 50pt tall, no uppercase. */
export function IosButton({
  children,
  tone = "primary",
  icon,
  full = true,
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "dark" | "tinted" | "plain" | "danger";
  icon?: IconKey;
  full?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-cta text-white",
    dark: "bg-ink text-white",
    tinted: "bg-mint text-deep",
    plain: "bg-white text-deep border border-line",
    danger: "bg-white text-cta border border-cta/40",
  };
  return (
    <button
      type="button"
      className={cn(
        "ios-press inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-[17px] font-semibold",
        tones[tone],
        full && "w-full",
        className,
      )}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

/** Material filled button — pill, ripple, sentence case. */
export function AndroidButton({
  children,
  tone = "filled",
  icon,
  full = true,
  className,
}: {
  children: ReactNode;
  tone?: "filled" | "tonal" | "outlined" | "text" | "dark";
  icon?: IconKey;
  full?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    filled: "bg-cta text-white",
    tonal: "bg-mint text-deep",
    outlined: "border border-line-dark/35 bg-transparent text-deep",
    text: "bg-transparent text-deep",
    dark: "bg-ink text-white",
  };
  return (
    <button
      type="button"
      className={cn(
        "ripple inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-bold",
        tones[tone],
        full && "w-full",
        className,
      )}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

/** Material floating action button. */
export function Fab({ icon, label }: { icon: IconKey; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="ripple absolute bottom-24 right-4 z-20 flex size-14 items-center justify-center rounded-[18px] bg-cta text-white shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
    >
      <Icon name={icon} size={24} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

/** iOS switch: wide capsule, white knob, deep green when on. */
export function IosSwitch({ on, label }: { on: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "relative h-8 w-13 shrink-0 rounded-full transition-colors",
        on ? "bg-deep" : "bg-ink/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-7 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-all",
          on ? "left-[26px]" : "left-0.5",
        )}
      />
    </button>
  );
}

/** Material switch: shorter track, small knob when off, tick when on. */
export function AndroidSwitch({ on, label }: { on: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        "relative flex h-8 w-13 shrink-0 items-center rounded-full border-2 transition-colors",
        on ? "border-deep bg-deep" : "border-grey/60 bg-ink/6",
      )}
    >
      <span
        className={cn(
          "absolute flex items-center justify-center rounded-full transition-all",
          on ? "left-[26px] size-6 bg-white text-deep" : "left-1.5 size-4 bg-grey",
        )}
      >
        {on && <Icon name="check" size={12} />}
      </span>
    </button>
  );
}

/** Touch-target-safe chip. iOS is a capsule, Android is a Material filter chip. */
export function MobileChip({
  children,
  platform,
  active,
  icon,
}: {
  children: ReactNode;
  platform: Platform;
  active?: boolean;
  icon?: IconKey;
}) {
  if (platform === "ios") {
    return (
      <span
        className={cn(
          "ios-press inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold",
          active ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line",
        )}
      >
        {icon && <Icon name={icon} size={14} />}
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "ripple inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[10px] px-3.5 text-[14px] font-semibold",
        active ? "bg-mint text-deep ring-1 ring-deep/35" : "text-ink ring-1 ring-line",
      )}
    >
      {active ? <Icon name="check" size={15} /> : icon ? <Icon name={icon} size={15} /> : null}
      {children}
    </span>
  );
}

/** iOS segmented control — grey track, white selected pill. */
export function IosSegmented({
  options,
  active,
  label,
}: {
  options: string[];
  active: string;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-[10px] bg-ink/8 p-0.5">
      {options.map((o) => (
        <span
          key={o}
          role="radio"
          aria-checked={o === active}
          tabIndex={o === active ? 0 : -1}
          className={cn(
            "flex h-10 flex-1 items-center justify-center rounded-[8px] text-[14px]",
            o === active
              ? "bg-white font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.16)]"
              : "font-medium text-ink/70",
          )}
        >
          {o}
        </span>
      ))}
    </div>
  );
}

/** Material tab row — underline indicator, uppercase-ish labels. */
export function AndroidTabs({
  options,
  active,
  label,
}: {
  options: string[];
  active: string;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex bg-cream">
      {options.map((o) => (
        <span
          key={o}
          role="tab"
          aria-selected={o === active}
          tabIndex={o === active ? 0 : -1}
          className={cn(
            "ripple flex min-h-11 flex-1 items-center justify-center border-b-[3px] px-2 text-[13px]",
            o === active
              ? "border-deep font-bold text-deep"
              : "border-transparent font-medium text-grey",
          )}
        >
          {o}
        </span>
      ))}
    </div>
  );
}

/**
 * Quantity control drawn in the platform idiom. iOS puts a grey capsule
 * around both glyphs; Material uses two outlined icon buttons.
 */
export function PlatformStepper({
  quantity,
  platform,
  removeAtMin,
}: {
  quantity: number;
  platform: Platform;
  removeAtMin?: boolean;
}) {
  const downIcon: IconKey = removeAtMin && quantity <= 1 ? "trash" : "minus";
  const downLabel = downIcon === "trash" ? "Remove item" : "Decrease quantity";
  if (platform === "ios") {
    return (
      <div role="group" aria-label="Quantity" className="flex shrink-0 items-center rounded-full bg-ink/6">
        <button type="button" aria-label={downLabel} className="ios-press flex size-11 items-center justify-center rounded-full text-deep">
          <Icon name={downIcon} size={16} />
        </button>
        <span className="num min-w-6 text-center text-[16px] font-semibold text-ink">{quantity}</span>
        <button type="button" aria-label="Increase quantity" className="ios-press flex size-11 items-center justify-center rounded-full text-deep">
          <Icon name="plus" size={16} />
        </button>
      </div>
    );
  }
  return (
    <div role="group" aria-label="Quantity" className="flex shrink-0 items-center gap-1">
      <button type="button" aria-label={downLabel} className="ripple flex size-11 items-center justify-center rounded-full border border-line-dark/30 text-deep">
        <Icon name={downIcon} size={17} />
      </button>
      <span className="num min-w-7 text-center text-[16px] font-bold text-ink">{quantity}</span>
      <button type="button" aria-label="Increase quantity" className="ripple flex size-11 items-center justify-center rounded-full border border-line-dark/30 text-deep">
        <Icon name="plus" size={17} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

export function Overlay({
  children,
  align = "bottom",
}: {
  children: ReactNode;
  align?: "bottom" | "center";
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-30 flex flex-col bg-ink/45 px-2",
        align === "bottom" ? "justify-end pb-2" : "justify-center px-6",
      )}
    >
      {children}
    </div>
  );
}

/** iOS action sheet: grouped choices, destructive in red, separate Cancel. */
export function IosActionSheet({
  title,
  message,
  actions,
  cancel = "Cancel",
}: {
  title?: string;
  message?: string;
  actions: { label: string; tone?: "default" | "danger" | "strong" }[];
  cancel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-[14px] bg-white/95 backdrop-blur">
        {(title || message) && (
          <div className="border-b border-line/70 px-6 py-3 text-center">
            {title && <p className="text-[13px] font-semibold text-grey">{title}</p>}
            {message && <p className="mt-0.5 text-[12px] leading-snug text-grey">{message}</p>}
          </div>
        )}
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            className={cn(
              "ios-press block min-h-14 w-full border-b border-line/70 px-4 text-[19px] last:border-0",
              a.tone === "danger"
                ? "text-cta"
                : a.tone === "strong"
                  ? "font-semibold text-deep"
                  : "text-deep",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="ios-press min-h-14 w-full rounded-[14px] bg-white text-[19px] font-semibold text-deep"
      >
        {cancel}
      </button>
    </div>
  );
}

/** Material dialog: left-aligned title, right-aligned text buttons. */
export function AndroidDialog({
  title,
  icon,
  children,
  confirm,
  dismiss,
  destructive,
}: {
  title: string;
  icon?: IconKey;
  children: ReactNode;
  confirm: string;
  dismiss?: string;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
      {icon && (
        <span className="mb-3 flex size-8 items-center justify-center text-deep">
          <Icon name={icon} size={24} />
        </span>
      )}
      <p className="font-display text-[22px] font-semibold leading-tight text-ink">{title}</p>
      <div className="mt-3 text-[14px] leading-relaxed text-ink/80">{children}</div>
      <div className="mt-6 flex items-center justify-end gap-2">
        {dismiss && (
          <span className="ripple inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-bold text-deep">
            {dismiss}
          </span>
        )}
        <span
          className={cn(
            "ripple inline-flex min-h-11 items-center rounded-full px-4 text-[14px] font-bold",
            destructive ? "text-cta" : "text-deep",
          )}
        >
          {confirm}
        </span>
      </div>
    </div>
  );
}

/** Material bottom sheet: square-ish top corners plus a drag handle bar. */
export function AndroidBottomSheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="-mx-2 rounded-t-[28px] bg-white pb-4">
      <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-ink/25" aria-hidden />
      <p className="px-6 pb-1 pt-4 font-display text-[20px] font-semibold text-ink">{title}</p>
      <div className="px-6">{children}</div>
    </div>
  );
}

/** iOS modal sheet: grabber, centred title, Done on the right. */
export function IosSheet({
  title,
  children,
  trailing = "Done",
}: {
  title: string;
  children: ReactNode;
  trailing?: string;
}) {
  return (
    <div className="-mx-2 rounded-t-[14px] bg-cream pb-6">
      <div className="mx-auto my-2.5 h-1.5 w-10 rounded-full bg-ink/20" aria-hidden />
      <div className="flex items-center justify-between border-b border-line px-4 pb-2.5">
        <span className="w-12" />
        <p className="text-[16px] font-semibold text-ink">{title}</p>
        <span className="w-12 text-right text-[16px] font-semibold text-deep">{trailing}</span>
      </div>
      <div className="px-4 pt-4">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status, progress and small parts                                    */
/* ------------------------------------------------------------------ */

/** Countdown: iOS draws a ring, Android draws a linear progress bar. */
export function CountdownMeter({
  platform,
  label,
  value,
  fraction,
  note,
}: {
  platform: Platform;
  label: string;
  value: string;
  fraction: number;
  note?: string;
}) {
  if (platform === "ios") {
    const r = 26;
    const c = 2 * Math.PI * r;
    return (
      <div className="flex items-center gap-3.5">
        <span className="relative flex size-16 shrink-0 items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" stroke="#6EC7CE" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="#000000"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - fraction)}
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span className="num absolute text-[14px] font-bold text-ink">{value}</span>
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold text-ink">{label}</span>
          {note && <span className="mt-0.5 block text-[12px] leading-snug text-grey">{note}</span>}
        </span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold text-ink">{label}</span>
        <span className="num text-[14px] font-bold text-deep">{value}</span>
      </div>
      <div
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-mint"
        role="progressbar"
        aria-valuenow={Math.round(fraction * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className="block h-full rounded-full bg-deep" style={{ width: `${fraction * 100}%` }} />
      </div>
      {note && <p className="mt-1.5 text-[12px] leading-snug text-grey">{note}</p>}
    </div>
  );
}

/** Inline notice. iOS keeps banners; Android prefers a snackbar, so this is iOS-leaning. */
export function MobileNotice({
  tone = "info",
  icon,
  title,
  children,
  className,
  role = "status",
}: {
  tone?: "info" | "warning" | "danger" | "success";
  icon?: IconKey;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const tones = {
    info: "border-deep/25 bg-mint",
    success: "border-deep/30 bg-mint",
    warning: "border-yellow bg-yellow/30",
    danger: "border-cta/35 bg-cta/8",
  };
  const icons: Record<string, IconKey> = {
    info: "sparkle",
    success: "check",
    warning: "alert",
    danger: "alert",
  };
  return (
    <div
      role={role}
      className={cn("flex gap-2.5 rounded-[12px] border p-3", tones[tone], className)}
    >
      <span className="mt-0.5 shrink-0 text-ink">
        <Icon name={icon ?? icons[tone]} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-[14px] font-semibold text-ink">{title}</p>}
        {children && (
          <div className={cn("text-[13px] leading-snug text-ink/80", title && "mt-0.5")}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all",
            i === active ? "h-2 w-5 bg-ink" : "size-2 bg-ink/25",
          )}
        />
      ))}
    </div>
  );
}

export function SpiceLevel({ level }: { level: 0 | 1 | 2 | 3 }) {
  if (level === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cta">
      <span aria-hidden>{"◆".repeat(level)}</span>
      <span className="sr-only">Spice level {level} of 3</span>
    </span>
  );
}

export function TotalRow({
  label,
  value,
  strong,
  negative,
}: {
  label: ReactNode;
  value: string;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className={cn(strong ? "text-[15px] font-semibold text-ink" : "text-[13px] text-grey")}>
        {label}
      </span>
      <span
        className={cn(
          "num",
          strong ? "text-[19px] font-bold text-ink" : "text-[13px] font-medium text-ink",
          negative && "text-deep",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Amount + caption block used on payment and confirmation screens. */
export function AmountBlock({ sen, caption }: { sen: number; caption: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-white px-4 py-3 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-grey">{caption}</p>
      <p className="num mt-1 font-display text-[30px] font-extrabold leading-none text-ink">
        {money(sen)}
      </p>
    </div>
  );
}

/**
 * The frames are static designs, so they cannot use `branchStatus()` — that
 * reads the clock and would make two frames on the same page disagree. These
 * helpers pin every frame to the Monday trading hours instead.
 */
export function designedHours(branch: Branch): string {
  const h = branch.hours.find((x) => x.day === 1) ?? branch.hours[0];
  return `${h.opens} – ${h.closes}`;
}

export function designedOpens(branch: Branch): string {
  return (branch.hours.find((x) => x.day === 1) ?? branch.hours[0]).opens;
}

export function designedCloses(branch: Branch): string {
  return (branch.hours.find((x) => x.day === 1) ?? branch.hours[0]).closes;
}

/** Masks the middle of a Malaysian mobile number: +60 13-••• 8890. */
export function maskPhone(phone: string): string {
  const parts = phone.split(" ");
  if (parts.length < 3) return phone;
  const prefix = parts[1].split("-")[0];
  return `${parts[0]} ${prefix}-••• ${parts[parts.length - 1]}`;
}

/* ------------------------------------------------------------------ */
/* Simulated software keyboard — decorative, for the search screens     */
/* ------------------------------------------------------------------ */

const KEY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export function SoftKeyboard({ platform }: { platform: Platform }) {
  const ios = platform === "ios";
  return (
    <div
      aria-hidden
      className={cn(
        "shrink-0 px-1 pb-6 pt-2",
        ios ? "bg-ink/10" : "border-t border-line bg-cream",
      )}
    >
      {KEY_ROWS.map((row, i) => (
        <div
          key={i}
          className={cn("flex justify-center gap-1.5 pb-1.5", i === 1 && "px-3", i === 2 && "px-9")}
        >
          {row.map((k) => (
            <span
              key={k}
              className={cn(
                "flex h-9 flex-1 items-center justify-center text-[16px]",
                ios
                  ? "rounded-[5px] bg-white font-normal text-ink shadow-[0_1px_0_rgba(0,0,0,0.3)]"
                  : "rounded-[6px] font-medium text-ink",
              )}
            >
              {k}
            </span>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-1.5 px-1">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center text-[13px] font-semibold text-ink",
            ios ? "rounded-[5px] bg-ink/15" : "rounded-[6px]",
          )}
        >
          123
        </span>
        <span
          className={cn(
            "flex h-9 flex-1 items-center justify-center text-[13px] text-grey",
            ios ? "rounded-[5px] bg-white" : "rounded-[6px]",
          )}
        >
          space
        </span>
        <span
          className={cn(
            "flex h-9 items-center justify-center px-4 text-[13px] font-semibold",
            ios ? "rounded-[5px] bg-deep text-white" : "rounded-[6px] bg-mint text-deep",
          )}
        >
          {ios ? "search" : "Go"}
        </span>
      </div>
    </div>
  );
}
