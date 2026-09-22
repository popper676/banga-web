"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Button } from "./primitives";
import { Icon } from "./icons";

/* ------------------------------------------------------------------ */
/* Focus-trapped dialog                                                */
/* ------------------------------------------------------------------ */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      returnTo.current?.focus();
    };
  }, [open, onClose]);

  return ref;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  tone = "neutral",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "neutral" | "danger";
}) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/55"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "sheet-up relative max-h-[92dvh] w-full overflow-auto rounded-t-[24px] bg-white sm:rounded-[20px]",
          widths[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-line bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 className={cn("text-[20px] leading-snug", tone === "danger" && "text-cta")}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[14px] leading-relaxed text-grey">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-grey transition-colors hover:bg-mint hover:text-ink"
          >
            <Icon name="cross" size={18} />
          </button>
        </div>
        {children && <div className="px-5 py-5 sm:px-6">{children}</div>}
        {footer && (
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-white px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep as is",
  destructive,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      tone={destructive ? "danger" : "neutral"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "primary" : "dark"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink/80">{body}</div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Right-side drawer (admin)                                           */
/* ------------------------------------------------------------------ */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Detail"}
        style={{ width: `min(${width}px, 100%)` }}
        className="relative flex h-full flex-col bg-white"
      >
        <div className="flex items-start gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-semibold text-ink">{title}</div>
            {subtitle && <div className="mt-0.5 text-[13px] text-grey">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-grey hover:bg-mint hover:text-ink"
          >
            <Icon name="cross" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-5">{children}</div>
        {footer && <div className="flex gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom sheet (mobile frames)                                        */
/* ------------------------------------------------------------------ */

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  platform = "ios",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  platform?: "ios" | "android";
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "sheet-up relative max-h-[86%] overflow-auto bg-white",
          platform === "ios" ? "rounded-t-[22px]" : "rounded-t-[28px]",
        )}
      >
        {platform === "ios" ? (
          <div className="flex justify-center pt-2.5">
            <span className="h-1 w-9 rounded-full bg-grey/40" />
          </div>
        ) : (
          <div className="flex justify-center pt-3">
            <span className="h-1 w-8 rounded-full bg-grey/35" />
          </div>
        )}
        {title && (
          <div className="px-5 pb-1 pt-3">
            <h3 className="text-[17px]">{title}</h3>
          </div>
        )}
        <div className="px-5 pb-5 pt-2">{children}</div>
        {footer && <div className="sticky bottom-0 border-t border-line bg-white px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toast host                                                          */
/* ------------------------------------------------------------------ */

const TOAST_TONE = {
  neutral: "border-line bg-white",
  success: "border-deep/30 bg-mint",
  warning: "border-yellow bg-yellow/30",
  danger: "border-cta/40 bg-cta/10",
} as const;

const TOAST_ICON = {
  neutral: "sparkle",
  success: "check",
  warning: "alert",
  danger: "alert",
} as const;

export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div
      className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "danger" ? "alert" : "status"}
          className={cn(
            "toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[14px] border px-4 py-3",
            TOAST_TONE[t.tone],
          )}
        >
          <span className="mt-0.5 text-ink">
            <Icon name={TOAST_ICON[t.tone]} size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-ink">{t.title}</p>
            {t.body && <p className="mt-0.5 text-[13px] leading-snug text-ink/75">{t.body}</p>}
          </div>
          {t.actionLabel && (
            <button
              onClick={() => {
                t.onAction?.();
                dismissToast(t.id);
              }}
              className="shrink-0 text-[13px] font-bold text-cta underline underline-offset-2"
            >
              {t.actionLabel}
            </button>
          )}
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-grey hover:text-ink"
          >
            <Icon name="cross" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
