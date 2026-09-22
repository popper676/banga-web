"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn, money } from "@/lib/format";
import { Icon, type IconKey } from "./icons";

/* ------------------------------------------------------------------ */
/* Field shell — persistent visible label, accessible error            */
/* ------------------------------------------------------------------ */

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-1 font-normal text-cta" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
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

const inputBase =
  "h-12 w-full rounded-[12px] border bg-white px-3.5 text-[16px] text-ink placeholder:text-grey/70 transition-colors focus:border-ink";

export function TextField({
  label,
  hint,
  error,
  required,
  iconStart,
  suffix,
  className,
  wrapperClassName,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  iconStart?: IconKey;
  suffix?: ReactNode;
  wrapperClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = rest.id ?? auto;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <div className="relative">
        {iconStart && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-grey">
            <Icon name={iconStart} size={17} />
          </span>
        )}
        <input
          {...rest}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            inputBase,
            iconStart && "pl-10.5",
            suffix && "pr-20",
            error ? "border-cta" : "border-line",
            className,
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-grey">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  showCount,
  maxLength,
  value,
  className,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = rest.id ?? auto;
  const length = typeof value === "string" ? value.length : 0;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <textarea
          {...rest}
          id={id}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            "min-h-24 w-full resize-y rounded-[12px] border bg-white p-3.5 text-[16px] text-ink placeholder:text-grey/70 focus:border-ink",
            error ? "border-cta" : "border-line",
            className,
          )}
        />
        {showCount && maxLength && (
          <span className="num absolute bottom-2.5 right-3 text-[11px] text-grey">
            {length}/{maxLength}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  className,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
} & InputHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = rest.id ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          id={id}
          value={rest.value}
          onChange={rest.onChange as never}
          disabled={rest.disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase,
            "appearance-none pr-10",
            error ? "border-cta" : "border-line",
            className,
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-grey">
          <Icon name="chevronDown" size={17} />
        </span>
      </div>
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* Choice rows — used for options, addresses, payment methods          */
/* ------------------------------------------------------------------ */

export function ChoiceRow({
  type = "radio",
  name,
  checked,
  onChange,
  disabled,
  disabledReason,
  title,
  description,
  priceDelta,
  trailing,
  children,
}: {
  type?: "radio" | "checkbox";
  name?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  disabledReason?: string;
  title: ReactNode;
  description?: ReactNode;
  priceDelta?: number;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div
      className={cn(
        "rounded-[14px] border transition-colors",
        checked ? "border-ink bg-mint" : "border-line bg-white hover:border-ink/35",
        disabled && "opacity-55",
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-13 cursor-pointer items-center gap-3 p-3.5",
          disabled && "cursor-not-allowed",
        )}
      >
        <input
          id={id}
          type={type}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className={cn(
            "size-5 shrink-0 accent-[var(--color-cta)]",
            type === "radio" ? "rounded-full" : "rounded",
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink">{title}</span>
          {description && (
            <span className="mt-0.5 block text-[13px] leading-snug text-grey">{description}</span>
          )}
          {disabled && disabledReason && (
            <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-cta">
              <Icon name="alert" size={12} />
              {disabledReason}
            </span>
          )}
        </span>
        {priceDelta !== undefined && priceDelta !== 0 && (
          <span className="num shrink-0 text-[14px] font-semibold text-ink">
            +{money(priceDelta)}
          </span>
        )}
        {trailing}
      </label>
      {children && checked && <div className="border-t border-line/70 p-3.5">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  full,
}: {
  options: { value: T; label: string; icon?: IconKey; disabled?: boolean; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
  full?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex gap-1 rounded-full border border-line bg-white p-1",
        full && "flex w-full",
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-[14px]",
              full && "flex-1",
              active ? "bg-ink text-white" : "text-ink hover:bg-mint",
            )}
            title={o.hint}
          >
            {o.icon && <Icon name={o.icon} size={15} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip filter row                                                     */
/* ------------------------------------------------------------------ */

export function Chip({
  active,
  onClick,
  children,
  icon,
  count,
  as = "button",
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  icon?: IconKey;
  count?: number;
  as?: "button" | "span";
}) {
  const cls = cn(
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
    active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/45",
  );
  if (as === "span") return <span className={cls}>{children}</span>;
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls}>
      {icon && <Icon name={icon} size={14} />}
      {children}
      {count !== undefined && <span className="num opacity-70">{count}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Quantity stepper                                                    */
/* ------------------------------------------------------------------ */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  label = "Quantity",
  removeAtMin,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  removeAtMin?: () => void;
}) {
  const dim = size === "sm" ? "size-9" : "size-11";
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => (value <= min && removeAtMin ? removeAtMin() : onChange(value - 1))}
        disabled={value <= min && !removeAtMin}
        aria-label={value <= min && removeAtMin ? "Remove item" : "Decrease quantity"}
        className={cn(
          dim,
          "inline-flex items-center justify-center rounded-full text-ink transition-colors hover:bg-mint disabled:opacity-35",
        )}
      >
        <Icon name={value <= min && removeAtMin ? "trash" : "minus"} size={16} />
      </button>
      <span
        className={cn("num min-w-8 text-center font-semibold", size === "sm" ? "text-[14px]" : "text-[16px]")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          dim,
          "inline-flex items-center justify-center rounded-full text-ink transition-colors hover:bg-mint disabled:opacity-35",
        )}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle                                                              */
/* ------------------------------------------------------------------ */

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[12px] leading-snug text-grey">{description}</span>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-deep" : "bg-grey/40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            checked ? "left-5.5" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
