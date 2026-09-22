"use client";

/**
 * Shared pieces for the live-operations half of the admin console.
 * Pure UI: every value comes from src/lib/mock-data.ts or useStore().
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn, countdown } from "@/lib/format";
import { PROTOTYPE_RULES } from "@/lib/mock-data";
import type { FulfilmentType, Order } from "@/lib/types";
import { Icon, type IconKey } from "@/components/ui/icons";
import { Badge } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Prototype clock                                                     */
/*                                                                     */
/* The mock orders are stamped on the evening of 21 September 2026. So  */
/* that elapsed times, SLA countdowns and "late" escalation read the    */
/* way they would during a real dinner service, operations screens run  */
/* on a prototype clock that starts at 19:08 that evening and then      */
/* ticks in real time.                                                 */
/* ------------------------------------------------------------------ */

export const OPS_CLOCK_START_ISO = "2026-09-21T19:08:00+08:00";
export const OPS_CLOCK_LABEL = "19:08, Mon 21 Sep";

/**
 * Effective "now" on the prototype clock, or null before mount.
 * Null on the server and on the first client render, so nothing
 * time-dependent can produce a hydration mismatch.
 */
export function useOpsClock(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    const base = Date.parse(OPS_CLOCK_START_ISO);
    mountedAt.current = Date.now();
    setNow(base);
    const id = window.setInterval(() => {
      setNow(base + (Date.now() - mountedAt.current));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** "19:02" straight out of the ISO string — no timezone guessing. */
export function timeOf(iso: string): string {
  return iso.slice(11, 16);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "21 Sep" */
export function dateOf(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  void y;
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`;
}

/** "21 Sep · 19:02" */
export function dateTimeOf(iso: string): string {
  return `${dateOf(iso)} · ${timeOf(iso)}`;
}

export function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
}

export function secondsSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - Date.parse(iso)) / 1000));
}

export function relativeAge(iso: string, now: number): string {
  const mins = minutesSince(iso, now);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr ago` : `${h} hr ${m} min ago`;
}

/**
 * The branch has 5 minutes to respond. With fast-forward on we compress
 * that 15× so a reviewer can watch the whole rule play out, while the copy
 * keeps quoting the real rule.
 */
export function slaWindowSeconds(fastForward: boolean): number {
  return fastForward
    ? Math.round(PROTOTYPE_RULES.branchSlaSeconds / 15)
    : PROTOTYPE_RULES.branchSlaSeconds;
}

/* ------------------------------------------------------------------ */
/* Masking                                                             */
/* ------------------------------------------------------------------ */

/** "+60 12-345 6789" → "+60 12-••• ••89" */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "•••• ••••";
  const head = phone.slice(0, 7);
  const tail = digits.slice(-2);
  return `${head}••• ••${tail}`;
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "•••";
  const shown = name.slice(0, 2);
  return `${shown}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`;
}

/* ------------------------------------------------------------------ */
/* KPI card with a change-versus-yesterday indicator                   */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  delta,
  deltaSuffix = "vs yesterday",
  deltaGoodWhen = "up",
  icon,
  tone = "neutral",
  loading,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  /** Percentage change. Zero renders as "no change". */
  delta?: number;
  deltaSuffix?: string;
  deltaGoodWhen?: "up" | "down";
  icon?: IconKey;
  tone?: "neutral" | "warning" | "danger";
  loading?: boolean;
}) {
  const up = (delta ?? 0) > 0;
  const flat = (delta ?? 0) === 0;
  const good = flat ? true : deltaGoodWhen === "up" ? up : !up;

  return (
    <div
      className={cn(
        "rounded-[14px] border p-4",
        tone === "danger"
          ? "border-cta/40 bg-cta/6"
          : tone === "warning"
            ? "border-yellow bg-yellow/20"
            : "border-line bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-grey">{label}</p>
        {icon && (
          <span className="shrink-0 text-grey">
            <Icon name={icon} size={15} />
          </span>
        )}
      </div>

      {loading ? (
        <div className="shimmer mt-2.5 h-7 w-20 rounded-[8px]" aria-hidden />
      ) : (
        <p className="num mt-2 font-display text-[26px] font-bold leading-none text-ink">{value}</p>
      )}

      {delta !== undefined && !loading && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[12px] font-semibold",
            flat ? "text-grey" : good ? "text-deep" : "text-cta",
          )}
        >
          <Icon name={flat ? "minus" : up ? "plus" : "minus"} size={12} />
          <span className="num">
            {flat ? "No change" : `${up ? "+" : "−"}${Math.abs(delta)}%`}
          </span>
          <span className="sr-only">{flat ? "" : up ? " higher" : " lower"}</span>
          <span className="font-normal text-grey">{deltaSuffix}</span>
        </p>
      )}

      {sub && <p className="mt-1.5 text-[12px] leading-snug text-grey">{sub}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Countdown to branch auto-rejection                                  */
/* ------------------------------------------------------------------ */

export function CountdownPill({
  secondsLeft,
  totalSeconds,
  size = "md",
  paused,
}: {
  secondsLeft: number;
  totalSeconds: number;
  size?: "sm" | "md" | "lg";
  paused?: boolean;
}) {
  const expired = secondsLeft <= 0;
  const urgent = !expired && secondsLeft <= Math.max(5, totalSeconds * 0.35);
  const pct = Math.max(0, Math.min(100, (secondsLeft / Math.max(1, totalSeconds)) * 100));

  return (
    <div
      className={cn(
        "rounded-[12px] border px-3 py-2",
        expired
          ? "border-cta/40 bg-cta/10"
          : urgent
            ? "border-cta/35 bg-cta/6"
            : "border-line bg-cream/70",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn(expired || urgent ? "text-cta" : "text-deep")}>
          <Icon name={expired ? "alert" : paused ? "clock" : "hourglass"} size={size === "lg" ? 18 : 15} />
        </span>
        <span
          className={cn(
            "num font-bold leading-none",
            size === "lg" ? "text-[26px]" : size === "sm" ? "text-[14px]" : "text-[18px]",
            expired || urgent ? "text-cta" : "text-ink",
          )}
        >
          {expired ? "0:00" : countdown(secondsLeft)}
        </span>
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-grey">
          {expired ? "Timed out" : paused ? "Held" : "to auto-reject"}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
        <div
          className={cn("h-full rounded-full", expired || urgent ? "bg-cta" : "bg-deep")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Elapsed-time escalation (kitchen + orders list)                     */
/* ------------------------------------------------------------------ */

export function elapsedTone(minutes: number, targetMinutes: number): "ok" | "watch" | "late" {
  if (minutes >= targetMinutes + 6) return "late";
  if (minutes >= targetMinutes) return "watch";
  return "ok";
}

export function ElapsedBadge({
  minutes,
  targetMinutes,
  size = "md",
}: {
  minutes: number;
  targetMinutes: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone = elapsedTone(minutes, targetMinutes);
  const label = tone === "late" ? "Late" : tone === "watch" ? "At target" : "On time";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 font-semibold",
        size === "lg" ? "h-9 text-[16px]" : size === "sm" ? "h-6 text-[12px]" : "h-7 text-[13px]",
        tone === "late"
          ? "border-cta/40 bg-cta text-white"
          : tone === "watch"
            ? "border-ink/15 bg-yellow text-ink"
            : "border-deep/25 bg-mint text-deep",
      )}
    >
      <Icon name={tone === "late" ? "alert" : tone === "watch" ? "hourglass" : "clock"} size={size === "lg" ? 16 : 13} />
      <span className="num">{minutes} min</span>
      <span className={size === "lg" ? "" : "sr-only"}>{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Fulfilment tag                                                      */
/* ------------------------------------------------------------------ */

export function FulfilmentTag({ type, branchName }: { type: FulfilmentType; branchName?: string }) {
  return (
    <Badge tone="neutral" icon={type === "delivery" ? "bike" : "bag"} soft>
      {type === "delivery" ? "Delivery" : "Pickup"}
      {branchName ? ` · ${branchName}` : ""}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Auto-refresh indicator                                              */
/* ------------------------------------------------------------------ */

export function AutoRefreshIndicator({
  seconds,
  live,
  label = "Auto-refreshing every 10 seconds",
}: {
  seconds: number;
  live: boolean;
  label?: string;
}) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-grey">
      <span
        className={cn("size-2 rounded-full", live ? "pulse-dot bg-deep" : "bg-grey/50")}
        aria-hidden
      />
      <span>{live ? label : "Live updates paused"}</span>
      <span className="num text-ink">
        {live ? `· updated ${seconds}s ago` : ""}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Screen-reader announcer for status changes                          */
/* ------------------------------------------------------------------ */

export function LiveAnnouncer({ message, assertive }: { message: string; assertive?: boolean }) {
  return (
    <p
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Allergen / kitchen note extraction                                  */
/* ------------------------------------------------------------------ */

const ALLERGY_WORDS = ["allerg", "nut", "dairy", "gluten", "no egg", "lactose"];

export interface OrderNoteFlag {
  text: string;
  kind: "allergy" | "kitchen" | "customer";
  source: string;
}

/** Collects every free-text note on an order so the kitchen cannot miss one. */
export function orderNoteFlags(order: Order): OrderNoteFlag[] {
  const flags: OrderNoteFlag[] = [];
  for (const l of order.lines) {
    if (!l.notes) continue;
    const allergy = ALLERGY_WORDS.some((w) => l.notes!.toLowerCase().includes(w));
    flags.push({ text: l.notes, kind: allergy ? "allergy" : "kitchen", source: l.name });
  }
  if (order.customerNotes) {
    flags.push({ text: order.customerNotes, kind: "customer", source: "Customer note" });
  }
  return flags;
}

export function NoteFlag({ flag }: { flag: OrderNoteFlag }) {
  const allergy = flag.kind === "allergy";
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-[10px] border px-2.5 py-2 text-[13px] leading-snug",
        allergy ? "border-cta/40 bg-cta/8 text-ink" : "border-line bg-cream/70 text-ink",
      )}
    >
      <span className={cn("mt-px shrink-0", allergy ? "text-cta" : "text-grey")}>
        <Icon name={allergy ? "alert" : "receipt"} size={14} />
      </span>
      <span>
        <span className="font-semibold">
          {allergy ? "Allergy note" : flag.kind === "customer" ? "Customer note" : "Kitchen note"} ·{" "}
          {flag.source}
        </span>
        <br />
        {flag.text}
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Small labelled row used in detail panels                            */
/* ------------------------------------------------------------------ */

export function DetailRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line/70 py-2 last:border-0">
      <dt className="text-[13px] text-grey">{label}</dt>
      <dd className={cn("text-right text-[13.5px] font-medium text-ink", mono && "num")}>
        {children}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prototype-rule footnote                                             */
/* ------------------------------------------------------------------ */

export function PrototypeNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[11.5px] leading-snug text-grey">
      <span className="mt-px shrink-0">
        <Icon name="sparkle" size={12} />
      </span>
      <span>{children}</span>
    </p>
  );
}

/** Line count for a table cell: "3 items · 6 units". */
export function itemSummary(order: Order): string {
  const units = order.lines.reduce((n, l) => n + l.quantity, 0);
  return `${order.lines.length} ${order.lines.length === 1 ? "item" : "items"} · ${units} units`;
}
