"use client";

import { money } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

/**
 * Full-screen card processing state. It is deliberately blunt about the two
 * things people actually worry about: closing the window and being charged
 * twice.
 */
export function PaymentProcessing({
  amount,
  orderCode,
  provider,
}: {
  amount: number;
  orderCode: string;
  provider: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[68] flex items-center justify-center bg-cream px-5"
    >
      <div className="w-full max-w-md text-center">
        <span className="spin mx-auto block size-12 rounded-full border-4 border-deep border-t-transparent" />
        <h1 className="mt-6 text-[26px]">Processing your payment</h1>
        <p className="num mt-2 text-[17px] font-semibold text-ink">{money(amount)}</p>

        <div className="mt-6 flex flex-col gap-3 rounded-[16px] border border-line bg-white p-5 text-left">
          <p className="flex items-start gap-2.5 text-[15px] font-semibold text-ink">
            <span className="mt-0.5 shrink-0 text-cta">
              <Icon name="alert" size={17} />
            </span>
            Do not close this window. This usually takes a few seconds.
          </p>
          <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink/80">
            <span className="mt-0.5 shrink-0 text-deep">
              <Icon name="shield" size={17} />
            </span>
            If you were charged, your order will appear automatically. We will never take two
            payments for the same order.
          </p>
        </div>

        <p className="num mt-4 text-[12px] text-grey">
          Order {orderCode} · secured by {provider}
        </p>
      </div>
    </div>
  );
}
