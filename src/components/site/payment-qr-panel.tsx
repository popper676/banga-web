"use client";

import { countdown, money } from "@/lib/format";
import { Button, Skeleton } from "@/components/ui/primitives";
import { QRCode } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";

export type QrState = "generating" | "live" | "expired";

/**
 * DuitNow dynamic QR. The code is a drawing — it encodes nothing and no
 * banking app is contacted.
 */
export function PaymentQrPanel({
  seed,
  state,
  remaining,
  amount,
  reference,
  disabled,
  onRegenerate,
  onSaveQr,
  onOpenBankingApp,
}: {
  seed: string;
  state: QrState;
  remaining: number;
  amount: number;
  reference: string;
  disabled?: boolean;
  onRegenerate: () => void;
  onSaveQr: () => void;
  onOpenBankingApp: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-3">
        <div className="relative rounded-[14px] border border-line bg-white">
          {state === "generating" ? (
            <div className="flex size-[264px] items-center justify-center">
              <Skeleton className="size-[240px] rounded-[12px]" />
              <span className="sr-only">Generating your DuitNow QR code</span>
            </div>
          ) : (
            <QRCode seed={seed} size={240} dimmed={state === "expired"} />
          )}

          {state === "expired" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[14px] bg-white/85 p-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-yellow text-ink">
                <Icon name="clock" size={20} />
              </span>
              <p className="text-[15px] font-semibold text-ink">This QR code has expired</p>
              <p className="text-[12px] leading-snug text-grey">
                No payment was taken. Generate a new code to try again.
              </p>
            </div>
          )}
        </div>

        {state === "live" && (
          <p className="num flex items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Icon name="clock" size={14} />
            Expires in {countdown(remaining)}
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <dl className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[13px] text-grey">Amount to pay</dt>
            <dd className="num text-[18px] font-bold text-ink">{money(amount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[13px] text-grey">Reference</dt>
            <dd className="num text-[13px] font-medium text-ink">{reference}</dd>
          </div>
        </dl>

        <ol className="mt-3 flex flex-col gap-1.5 text-[13px] leading-snug text-ink/80">
          <li>1. Open any Malaysian banking or e-wallet app.</li>
          <li>2. Choose Scan &amp; Pay, then scan this code.</li>
          <li>3. Confirm the amount — this page updates on its own.</li>
        </ol>

        <div
          aria-live="polite"
          className="mt-4 flex items-center gap-2 rounded-[12px] border border-line bg-cream/70 px-3 py-2.5"
        >
          {state === "live" ? (
            <>
              <span className="pulse-dot size-2.5 shrink-0 rounded-full bg-deep" aria-hidden />
              <Icon name="hourglass" size={15} />
              <span className="text-[14px] font-medium text-ink">Waiting for payment…</span>
            </>
          ) : state === "generating" ? (
            <>
              <Icon name="hourglass" size={15} />
              <span className="text-[14px] font-medium text-ink">Generating your QR code…</span>
            </>
          ) : (
            <>
              <Icon name="alert" size={15} />
              <span className="text-[14px] font-medium text-ink">QR expired — nothing charged</span>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {state === "expired" ? (
            <Button variant="dark" iconStart="qr" onClick={onRegenerate} disabled={disabled}>
              Generate new QR
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                iconStart="download"
                onClick={onSaveQr}
                disabled={disabled || state !== "live"}
              >
                Save QR to photos
              </Button>
              <Button
                variant="secondary"
                size="sm"
                iconStart="phone"
                onClick={onOpenBankingApp}
                disabled={disabled || state !== "live"}
              >
                Open banking app
              </Button>
            </>
          )}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-grey">
          Opening a banking app works on a phone. On a laptop, scan the code with your phone
          instead.
        </p>
      </div>
    </div>
  );
}
