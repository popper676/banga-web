import { BRANCHES } from "./mock-data";
import type { Branch } from "./types";

/** Money is stored in integer sen. Always render with tabular numerals. */
export function money(sen: number): string {
  return `RM${(sen / 100).toFixed(2)}`;
}

/** Screen readers should hear "16 ringgit 90 sen", not "R M 16.90". */
export function moneyLabel(sen: number): string {
  const ringgit = Math.floor(sen / 100);
  const cents = sen % 100;
  return cents === 0 ? `${ringgit} ringgit` : `${ringgit} ringgit ${cents} sen`;
}

export function cn(...parts: unknown[]): string {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function dayName(day: number): string {
  return DAY_NAMES[day] ?? "";
}

/**
 * Branch open status, computed from hours in Asia/Kuala_Lumpur.
 * Never stored as a boolean that someone forgets to flip.
 */
export function branchStatus(
  branch: Branch,
  now: Date = new Date(),
): { open: boolean; label: string; detail: string; nextChange: string } {
  const jsDay = now.getDay(); // 0 = Sunday
  const day = jsDay === 0 ? 7 : jsDay;
  const today = branch.hours.find((h) => h.day === day);
  const minutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  if (!today) {
    return { open: false, label: "Closed today", detail: "Closed today", nextChange: "" };
  }

  const opens = toMinutes(today.opens);
  const closes = toMinutes(today.closes);
  const open = minutes >= opens && minutes < closes;

  return {
    open,
    label: open ? "Open now" : "Closed",
    detail: open ? `Open until ${today.closes}` : `Opens ${today.opens}`,
    nextChange: open ? today.closes : today.opens,
  };
}

export function todayHours(branch: Branch, now: Date = new Date()): string {
  const jsDay = now.getDay();
  const day = jsDay === 0 ? 7 : jsDay;
  const today = branch.hours.find((h) => h.day === day);
  return today ? `${today.opens} – ${today.closes}` : "Closed";
}

/** Nearest branch that can fulfil the requested mode. */
export function recommendBranch(fulfilment: "pickup" | "delivery" = "delivery"): Branch {
  const eligible = BRANCHES.filter((b) =>
    fulfilment === "delivery" ? b.supportsDelivery : b.supportsPickup,
  );
  return [...eligible].sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? BRANCHES[0];
}

export function etaRange(branch: Branch, fulfilment: "pickup" | "delivery"): string {
  const base = branch.prepTimeMinutes;
  return fulfilment === "pickup"
    ? `${base}–${base + 8} min`
    : `${base + 12}–${base + 25} min`;
}

export function clockNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function countdown(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function orderCode(seq: number): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `BG-${yy}${mm}${dd}-${String(seq).padStart(4, "0")}`;
}

export const SST_RATE = 0.06;
