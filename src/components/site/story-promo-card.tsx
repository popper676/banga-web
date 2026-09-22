"use client";

import { useState } from "react";
import { BRANCHES } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Promotion } from "@/lib/types";
import { Badge, ButtonLink, KeyValue } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

/** "2026-12-31" → "31 December 2026" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function branchScope(branchIds: string[]): string {
  if (branchIds.length >= BRANCHES.length) return "Both branches";
  return branchIds.map((id) => BRANCHES.find((b) => b.id === id)?.shortName ?? id).join(", ");
}

export function PromoCard({ promotion, expired }: { promotion: Promotion; expired?: boolean }) {
  const { pushToast } = useStore();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!promotion.code) return;
    try {
      await navigator.clipboard.writeText(promotion.code);
    } catch {
      /* Clipboard access can be blocked — the code stays visible and selectable. */
    }
    setCopied(true);
    pushToast({
      tone: "success",
      title: `${promotion.code} copied`,
      body: "Paste it into the promo field at checkout.",
    });
    window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[20px] border bg-white p-6",
        expired ? "border-line opacity-60" : "border-line",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide",
            expired ? "bg-ink/8 text-grey" : "bg-yellow text-ink",
          )}
        >
          <Icon name="tag" size={13} />
          {promotion.badge}
        </span>
        {expired ? (
          <Badge tone="neutral" icon="clock" soft>
            Expired
          </Badge>
        ) : (
          <Badge tone="info" icon="pin" soft>
            {branchScope(promotion.branchIds)}
          </Badge>
        )}
      </div>

      <h3 className="mt-4 text-[22px] leading-snug">{promotion.name}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-grey">{promotion.description}</p>

      {/* Code + copy */}
      <div className="mt-5">
        {promotion.code ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "num inline-flex h-11 items-center rounded-[12px] border border-dashed px-4 font-display text-[17px] font-bold tracking-[0.12em]",
                expired ? "border-line text-grey line-through" : "border-deep/40 bg-mint text-deep",
              )}
            >
              {promotion.code}
            </span>
            <button
              type="button"
              onClick={copy}
              disabled={expired}
              className={cn(
                "inline-flex h-11 min-w-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                expired
                  ? "cursor-not-allowed border-line text-grey"
                  : "border-ink/20 bg-white text-ink hover:border-ink hover:bg-mint",
              )}
            >
              <Icon name={copied ? "check" : "receipt"} size={16} />
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-[12px] bg-mint px-4 py-3 text-[14px] font-medium text-deep">
            <Icon name="sparkle" size={15} />
            No code needed — applied automatically at checkout.
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {copied ? `${promotion.code} copied to clipboard` : ""}
        </p>
      </div>

      <dl className="mt-5 border-t border-line pt-2">
        <KeyValue k="Minimum spend" v={<span className="num">{money(promotion.minSpend)}</span>} />
        <KeyValue k="Available at" v={branchScope(promotion.branchIds)} />
        <KeyValue
          k={expired ? "Ended" : "Ends"}
          v={<span className="num">{longDate(promotion.endsOn)}</span>}
        />
      </dl>

      <details className="mt-3 border-t border-line pt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[14px] font-semibold text-deep">
          <Icon name="chevronDown" size={15} />
          Terms and conditions
        </summary>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-grey">
          {promotion.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li>Prototype data — no promotion is redeemable against a real order.</li>
        </ul>
      </details>

      <div className="mt-5 flex-1" />

      {expired ? (
        <p className="flex items-center gap-2 text-[13px] font-medium text-grey">
          <Icon name="alert" size={14} />
          This offer has ended and can no longer be applied at checkout.
        </p>
      ) : (
        <ButtonLink href="/menu" variant="secondary" iconEnd="arrowRight" className="self-start">
          Order with this offer
        </ButtonLink>
      )}
    </article>
  );
}
