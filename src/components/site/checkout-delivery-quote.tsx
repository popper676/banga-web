"use client";

import { useRef, useState } from "react";
import { countdown, money } from "@/lib/format";
import { Icon } from "@/components/ui/icons";
import { useCountdown, useDelayedStep } from "./checkout-hooks";

/** First re-quote moves the fee so the "fee updated" path is demonstrable. */
const FIRST_REQUOTE_DELTA = 120;

/**
 * Lalamove quotation countdown. When it runs out the quote is refreshed
 * silently; a non-blocking notice appears only when the fee actually changed.
 */
export function CheckoutDeliveryQuote({
  active,
  fastForward,
  currentFee,
  onFeeChange,
}: {
  active: boolean;
  fastForward: boolean;
  currentFee: number;
  onFeeChange: (deltaSen: number) => void;
}) {
  const [cycle, setCycle] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const requotes = useRef(0);
  const after = useDelayedStep();

  // 4:38 on first paint, matching the wireframe, then a full 5-minute window.
  const windowSeconds = cycle === 0 ? 278 : 300;

  const remaining = useCountdown({
    seconds: windowSeconds,
    fastForward,
    running: active,
    restartKey: cycle,
    onComplete: () => {
      setRefreshing(true);
      after(() => {
        setRefreshing(false);
        requotes.current += 1;
        if (requotes.current === 1) {
          const from = currentFee;
          onFeeChange(FIRST_REQUOTE_DELTA);
          setNotice(
            `Delivery fee updated from ${money(from)} to ${money(from + FIRST_REQUOTE_DELTA)} — Lalamove re-quoted this address.`,
          );
        }
        setCycle((c) => c + 1);
      }, fastForward ? 700 : 1400);
    },
  });

  if (!active) return null;

  return (
    <div className="mt-2">
      <p className="flex items-center gap-1.5 text-[12px] text-grey">
        <Icon name={refreshing ? "refund" : "clock"} size={13} />
        {refreshing ? (
          <span>Refreshing the delivery quote…</span>
        ) : (
          <span className="num">Delivery quote valid {countdown(remaining)}</span>
        )}
      </p>

      <div aria-live="polite" role="status">
        {notice && (
          <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-yellow bg-yellow/25 p-2.5">
            <span className="mt-px shrink-0 text-ink">
              <Icon name="alert" size={14} />
            </span>
            <p className="text-[12px] leading-snug text-ink">
              <span className="font-semibold">Delivery fee updated.</span> {notice}
            </p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss delivery fee notice"
              className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full text-grey hover:bg-white hover:text-ink"
            >
              <Icon name="cross" size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
