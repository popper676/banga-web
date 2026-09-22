"use client";

import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

export const CHECKOUT_STEPS = ["Fulfilment", "Details", "Review", "Payment"] as const;

export type CheckoutStep = 1 | 2 | 3 | 4;

/**
 * Four-step progress indicator. Steps 1–3 live on /checkout, step 4 is the
 * payment screen, so the same component renders on both.
 */
export function CheckoutSteps({
  current,
  onSelect,
}: {
  current: CheckoutStep;
  /** When provided, completed steps become buttons that jump to the section. */
  onSelect?: (step: CheckoutStep) => void;
}) {
  return (
    <nav aria-label="Checkout progress" className="no-print">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {CHECKOUT_STEPS.map((label, i) => {
          const step = (i + 1) as CheckoutStep;
          const done = step < current;
          const active = step === current;
          const interactive = Boolean(onSelect) && done;

          const body = (
            <>
              <span
                className={cn(
                  "num flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold",
                  done
                    ? "border-deep bg-deep text-white"
                    : active
                      ? "border-deep bg-white text-deep"
                      : "border-line bg-white text-grey",
                )}
              >
                {done ? <Icon name="check" size={14} /> : step}
              </span>
              <span
                className={cn(
                  "text-[14px]",
                  done || active ? "font-semibold text-ink" : "text-grey",
                )}
              >
                {label}
              </span>
            </>
          );

          return (
            <li key={label} className="flex items-center gap-2">
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onSelect?.(step)}
                  className="flex min-h-11 items-center gap-2 rounded-full pr-2 hover:bg-mint"
                >
                  {body}
                  <span className="sr-only">— completed, go back to this step</span>
                </button>
              ) : (
                <span
                  className="flex min-h-11 items-center gap-2"
                  aria-current={active ? "step" : undefined}
                >
                  {body}
                  {active && <span className="sr-only">— current step</span>}
                </span>
              )}
              {step < 4 && <span className="h-0.5 w-6 bg-line sm:w-10" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
