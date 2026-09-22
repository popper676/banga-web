"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

/* ------------------------------------------------------------------ */
/* Contrast maths — real WCAG ratios, computed, not asserted           */
/* ------------------------------------------------------------------ */

function channel(v: number) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastVerdict(ratio: number) {
  if (ratio >= 7) return { label: "AAA", tone: "pass" as const, note: "Passes AAA for body text" };
  if (ratio >= 4.5) return { label: "AA", tone: "pass" as const, note: "Passes AA for body text" };
  if (ratio >= 3) return { label: "AA Large", tone: "warn" as const, note: "Large text (24px+) and UI only" };
  return { label: "Fail", tone: "fail" as const, note: "Decorative use only — never text" };
}

/* ------------------------------------------------------------------ */
/* Page scaffolding                                                    */
/* ------------------------------------------------------------------ */

export interface DsEntry {
  id: string;
  label: string;
}

export function DsSection({
  id,
  number,
  title,
  lead,
  children,
}: {
  id: string;
  number: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line pt-10">
      <p className="num text-[12px] font-bold uppercase tracking-[0.16em] text-deep">{number}</p>
      <h2 id={`${id}-h`} className="mt-1 text-[clamp(24px,3vw,34px)] leading-tight">
        {title}
      </h2>
      {lead && <div className="mt-2 max-w-3xl text-[15px] leading-relaxed text-grey">{lead}</div>}
      <div className="mt-7 flex flex-col gap-8">{children}</div>
    </section>
  );
}

/** One documented item: the thing itself, plus what it is for. */
export function DsItem({
  name,
  spec,
  usage,
  children,
  surface = "white",
  wide,
}: {
  name: string;
  spec?: string;
  usage?: ReactNode;
  children: ReactNode;
  surface?: "white" | "cream" | "ink" | "mint";
  wide?: boolean;
}) {
  const bg = {
    white: "bg-white",
    cream: "bg-cream",
    ink: "bg-ink",
    mint: "bg-mint",
  }[surface];

  return (
    <div className={cn("rounded-[16px] border border-line bg-white", wide && "col-span-full")}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3">
        <h3 className="text-[15px] font-semibold text-ink">{name}</h3>
        {spec && <p className="num text-[12px] text-grey">{spec}</p>}
      </div>
      <div className={cn("flex flex-wrap items-center gap-3 border-b border-line p-5", bg)}>
        {children}
      </div>
      {usage && (
        <div className="flex items-start gap-2 px-4 py-3 text-[13px] leading-snug text-ink/80">
          <span className="mt-0.5 shrink-0 text-deep">
            <Icon name="sparkle" size={14} />
          </span>
          <div>{usage}</div>
        </div>
      )}
    </div>
  );
}

export function DsGrid({ cols = 2, children }: { cols?: 1 | 2 | 3; children: ReactNode }) {
  const c = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-2 xl:grid-cols-3" }[cols];
  return <div className={cn("grid gap-4", c)}>{children}</div>;
}

/** Do / Don't pair — the part people actually get wrong. */
export function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[14px] border border-deep/25 bg-mint p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-deep">
          <Icon name="check" size={15} /> Do
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {dos.map((d) => (
            <li key={d} className="text-[14px] leading-snug text-ink">
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[14px] border border-cta/30 bg-cta/8 p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-cta-dark">
          <Icon name="cross" size={15} /> Don&rsquo;t
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {donts.map((d) => (
            <li key={d} className="text-[14px] leading-snug text-ink">
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Token reference table. */
export function TokenTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-cream/60">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-grey"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-[13.5px] text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sticky contents rail. */
export function DsNav({ entries }: { entries: DsEntry[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] font-semibold text-ink lg:hidden"
      >
        <Icon name="list" size={16} />
        Contents
        <Icon name={open ? "chevronDown" : "chevronRight"} size={15} />
      </button>

      <nav
        aria-label="Design system contents"
        className={cn(
          "lg:sticky lg:top-24 lg:block lg:self-start",
          open ? "block" : "hidden",
        )}
      >
        <p className="hidden pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-grey lg:block">
          Contents
        </p>
        <ol className="flex flex-col gap-0.5 rounded-[14px] border border-line bg-white p-2 lg:border-0 lg:bg-transparent lg:p-0">
          {entries.map((e, i) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={() => setOpen(false)}
                className="flex min-h-9 items-center gap-2 rounded-[9px] px-2 text-[13.5px] font-medium text-ink/80 hover:bg-mint hover:text-ink"
              >
                <span className="num w-5 shrink-0 text-[11px] text-grey">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {e.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
