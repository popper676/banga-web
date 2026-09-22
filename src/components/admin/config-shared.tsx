"use client";

/**
 * Shared pieces for the catalogue, money and configuration admin screens.
 * Denser than the customer site: 13–14px controls, white cards on cream.
 * Nothing here talks to a server.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Segmented } from "@/components/ui/forms";
import { Icon, type IconKey } from "@/components/ui/icons";
import { Badge, Button, Skeleton, SkeletonRow } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* Screen state — every admin screen can be previewed in all 4 states  */
/* ------------------------------------------------------------------ */

export type ScreenState = "ready" | "loading" | "empty" | "error";

export function useScreenState(loadMs = 520) {
  const [state, setState] = useState<ScreenState>("loading");
  useEffect(() => {
    const timer = window.setTimeout(() => setState("ready"), loadMs);
    return () => window.clearTimeout(timer);
  }, [loadMs]);
  return { state, setState };
}

export function StateSwitch({
  state,
  onChange,
}: {
  state: ScreenState;
  onChange: (s: ScreenState) => void;
}) {
  return (
    <Segmented<ScreenState>
      size="sm"
      label="Preview screen state"
      value={state}
      onChange={onChange}
      options={[
        { value: "ready", label: "Data" },
        { value: "loading", label: "Loading" },
        { value: "empty", label: "Empty" },
        { value: "error", label: "Error" },
      ]}
    />
  );
}

/** Reference id shown on error states so support has something to quote. */
export function errorRef(prefix: string): string {
  return `${prefix}-ERR-4412`;
}

/* ------------------------------------------------------------------ */
/* Loading shapes                                                      */
/* ------------------------------------------------------------------ */

export function TableSkeleton({
  cols = 6,
  rows = 6,
  caption,
}: {
  cols?: number;
  rows?: number;
  caption: string;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption} — loading</caption>
        <thead>
          <tr className="border-b border-line bg-cream/60">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} scope="col" className="px-4 py-3">
                <Skeleton className="h-3 w-20" />
                <span className="sr-only">Column {i + 1}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-[14px] border border-line bg-white p-4">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 flex flex-col gap-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TileSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[14px] border border-line bg-white p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dense filter controls                                               */
/* ------------------------------------------------------------------ */

export function Toolbar({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-[14px] border border-line bg-white p-3",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-36 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wide text-grey">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-[10px] border border-line bg-white pl-3 pr-8 text-[13px] font-medium text-ink focus:border-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-grey">
          <Icon name="chevronDown" size={15} />
        </span>
      </div>
    </div>
  );
}

export function FilterSearch({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-56 flex-1 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wide text-grey">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey">
          <Icon name="search" size={15} />
        </span>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-[14px] text-ink placeholder:text-grey/70 focus:border-ink"
        />
      </div>
    </div>
  );
}

export function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wide text-grey">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="num h-10 rounded-[10px] border border-line bg-white px-3 text-[13px] font-medium text-ink focus:border-ink"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Announcements                                                       */
/* ------------------------------------------------------------------ */

/**
 * Returns a visually hidden live region plus a setter. Every admin change
 * that is not obvious from a toast is announced through this.
 */
export function useAnnounce(): [ReactNode, (message: string) => void] {
  const [message, setMessage] = useState("");
  const node = (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  );
  return [node, setMessage];
}

/** Visible result counter that doubles as a live region. */
export function ResultCount({ children }: { children: ReactNode }) {
  return (
    <p className="num text-[13px] text-grey" aria-live="polite">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Dirty state                                                         */
/* ------------------------------------------------------------------ */

export function useDirtyGuard(close: () => void) {
  const [dirty, setDirty] = useState(false);
  const [asking, setAsking] = useState(false);

  const attemptClose = useCallback(() => {
    if (dirty) setAsking(true);
    else close();
  }, [dirty, close]);

  const discard = useCallback(() => {
    setDirty(false);
    setAsking(false);
    close();
  }, [close]);

  const saved = useCallback(() => setDirty(false), []);

  return { dirty, setDirty, asking, setAsking, attemptClose, discard, saved };
}

export function DirtyFlag({ dirty }: { dirty: boolean }) {
  if (!dirty) {
    return (
      <Badge tone="neutral" icon="check" soft>
        All changes saved
      </Badge>
    );
  }
  return (
    <Badge tone="warning" icon="alert" soft>
      Unsaved changes
    </Badge>
  );
}

/**
 * Settings-style card: its own heading, its own Save button, its own
 * dirty-state guard. Sections never save each other's fields.
 */
export function SaveSection({
  id,
  title,
  description,
  icon,
  children,
  onSave,
  dirty,
  onDiscard,
  saveLabel = "Save section",
  footerNote,
}: {
  id: string;
  title: string;
  description?: string;
  icon?: IconKey;
  children: ReactNode;
  onSave: () => void;
  dirty: boolean;
  onDiscard: () => void;
  saveLabel?: string;
  footerNote?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-[14px] border border-line bg-white"
    >
      <div className="flex flex-wrap items-start gap-3 border-b border-line px-4 py-3">
        {icon && (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-mint text-deep">
            <Icon name={icon} size={16} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-[15px]">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[13px] leading-snug text-grey">{description}</p>}
        </div>
        <DirtyFlag dirty={dirty} />
      </div>
      <div className="p-4">{children}</div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        {footerNote && <p className="min-w-0 flex-1 text-[12px] leading-snug text-grey">{footerNote}</p>}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="ghost" onClick={onDiscard} disabled={!dirty}>
            Discard
          </Button>
          <Button size="sm" variant="dark" onClick={onSave} disabled={!dirty} iconStart="check">
            {saveLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Masked provider keys — placeholders only, never a real secret       */
/* ------------------------------------------------------------------ */

export function MaskedKeyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink">
        {label}
        <Badge tone="neutral" icon="lock" soft>
          Prototype placeholder
        </Badge>
      </label>
      <input
        id={id}
        readOnly
        value={value}
        aria-describedby={`${id}-hint`}
        className="num h-11 w-full rounded-[10px] border border-line bg-cream/60 px-3 text-[14px] text-grey"
      />
      <p id={`${id}-hint`} className="text-[12px] leading-snug text-grey">
        {hint ??
          "No real key is stored anywhere in this prototype. The value above is a masked placeholder and cannot be revealed or edited."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs (drawer editors and detail panes)                              */
/* ------------------------------------------------------------------ */

export function Tabs<T extends string>({
  idBase,
  tabs,
  value,
  onChange,
  label,
}: {
  idBase: string;
  tabs: { value: T; label: string; icon?: IconKey }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const move = (delta: number) => {
    const i = tabs.findIndex((t) => t.value === value);
    const next = tabs[(i + delta + tabs.length) % tabs.length];
    onChange(next.value);
    document.getElementById(`${idBase}-${next.value}-tab`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-line"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            id={`${idBase}-${t.value}-tab`}
            aria-selected={active}
            aria-controls={`${idBase}-${t.value}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold transition-colors",
              active ? "border-ink text-ink" : "border-transparent text-grey hover:text-ink",
            )}
          >
            {t.icon && <Icon name={t.icon} size={14} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idBase,
  value,
  active,
  children,
}: {
  idBase: string;
  value: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${idBase}-${value}-panel`}
      aria-labelledby={`${idBase}-${value}-tab`}
      hidden={!active}
      className="pt-4"
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Money input — stored as integer sen, typed in ringgit               */
/* ------------------------------------------------------------------ */

export function MoneyField({
  label,
  sen,
  onChange,
  hint,
  error,
  required,
  disabled,
}: {
  label: string;
  sen: number;
  onChange: (sen: number) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(() => (sen / 100).toFixed(2));

  const commit = (raw: string) => {
    setText(raw);
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    onChange(cleaned === "" || !Number.isFinite(parsed) ? 0 : Math.round(parsed * 100));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-1 font-normal text-cta" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-grey">
          RM
        </span>
        <input
          id={id}
          inputMode="decimal"
          value={text}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            "num h-11 w-full rounded-[10px] border bg-white pl-10 pr-3 text-[15px] text-ink focus:border-ink disabled:bg-cream/60 disabled:text-grey",
            error ? "border-cta" : "border-line",
          )}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12px] leading-snug text-grey">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-[12px] font-medium leading-snug text-cta"
        >
          <span className="mt-px">
            <Icon name="alert" size={13} />
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small layout helpers                                                */
/* ------------------------------------------------------------------ */

export function InsightLine({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[13px] leading-relaxed text-grey">
      <span className="mt-0.5 shrink-0 text-deep">
        <Icon name="sparkle" size={14} />
      </span>
      <span>{children}</span>
    </p>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "sm:grid-cols-2",
        cols === 3 && "sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function SubHeading({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[14px] font-semibold text-ink">{children}</h3>
      {note && <p className="mt-0.5 text-[12px] leading-snug text-grey">{note}</p>}
    </div>
  );
}

export function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-2 last:border-0">
      <dt className="text-[13px] text-grey">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-ink">{children}</dd>
    </div>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="num text-[13px] font-semibold tracking-tight text-ink">{children}</span>;
}

/** Tiny bulk-action bar that appears when table rows are selected. */
export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-2 rounded-[14px] border border-ink/25 bg-mint px-3 py-2.5"
    >
      <p className="num text-[13px] font-semibold text-ink">
        {count} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-[13px] font-semibold text-deep underline underline-offset-2"
      >
        Clear selection
      </button>
    </div>
  );
}

export function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex size-9 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="size-4.5 accent-[var(--color-cta)]"
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination helper                                                   */
/* ------------------------------------------------------------------ */

export function usePaged<T>(rows: T[], perPage = 8) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, pages);
  const slice = useMemo(
    () => rows.slice((current - 1) * perPage, current * perPage),
    [rows, current, perPage],
  );
  useEffect(() => setPage(1), [rows.length]);
  return { page: current, setPage, pages, slice, total: rows.length };
}

/* ------------------------------------------------------------------ */
/* Simulated exports                                                   */
/* ------------------------------------------------------------------ */

export function useSimulatedExport() {
  const { pushToast } = useStore();
  return useCallback(
    (kind: "CSV" | "PDF", what: string) =>
      pushToast({
        tone: "success",
        title: `${kind} export ready`,
        body: `${what}. Simulated only — this prototype does not generate files.`,
      }),
    [pushToast],
  );
}

/* ------------------------------------------------------------------ */
/* Copy shared across money screens                                    */
/* ------------------------------------------------------------------ */

export const PROVIDER_COPY = {
  visa: { method: "Visa card", provider: "Maybank", providerLine: "Processed securely by Maybank" },
  duitnow_qr: { method: "DuitNow QR", provider: "OXPay", providerLine: "DuitNow QR powered by OXPay" },
} as const;

export const REFUND_TIMING =
  "Funds return to the original payment method in 3 to 5 working days, depending on the customer's bank.";
