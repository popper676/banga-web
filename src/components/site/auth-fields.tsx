"use client";

/**
 * Small form pieces shared by the register, guest and account screens.
 *
 * UI only. Nothing here validates, stores or transmits a real credential —
 * the prototype has no auth service, no database and no network calls.
 */

import { type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

/* ------------------------------------------------------------------ */
/* Error summary — sits at the top of every long form                  */
/* ------------------------------------------------------------------ */

export interface FieldError {
  /** id of the input this message belongs to, so the link moves focus there */
  fieldId: string;
  message: string;
}

export function ErrorSummary({
  id,
  errors,
  intro,
}: {
  id: string;
  errors: FieldError[];
  intro?: string;
}) {
  if (errors.length === 0) return null;
  return (
    <div
      id={id}
      tabIndex={-1}
      role="alert"
      className="rounded-[14px] border border-cta/35 bg-cta/8 p-4"
    >
      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
        <Icon name="alert" size={17} />
        There {errors.length === 1 ? "is 1 problem" : `are ${errors.length} problems`} with this form
      </p>
      {intro && <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{intro}</p>}
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[14px] text-ink/85">
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a href={`#${e.fieldId}`} className="font-semibold text-cta underline underline-offset-2">
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Malaysian mobile number with a visible +60 prefix                   */
/* ------------------------------------------------------------------ */

export const PHONE_PREFIX = "+60";

/** Digits only, without the country code and without a leading zero. */
export function nationalDigits(input: string): string {
  return input.replace(/\D/g, "").replace(/^60/, "").replace(/^0+/, "");
}

export function phoneError(input: string): string | undefined {
  const digits = nationalDigits(input);
  if (digits.length === 0) return "Enter the mobile number the branch and the rider can call.";
  if (!digits.startsWith("1"))
    return "A Malaysian mobile number starts with 1 after +60, for example 12-345 6789.";
  if (digits.length < 9 || digits.length > 10)
    return "A Malaysian mobile number has 9 or 10 digits after +60.";
  return undefined;
}

/** "123456789" → "+60 12-345 6789" — the format used across the prototype. */
export function fullPhone(input: string): string {
  const d = nationalDigits(input);
  if (d.length < 3) return `${PHONE_PREFIX} ${d}`.trim();
  const head = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `${PHONE_PREFIX} ${head}-${rest}`;
  return `${PHONE_PREFIX} ${head}-${rest.slice(0, rest.length - 4)} ${rest.slice(-4)}`;
}

export function PhoneField({
  id,
  label = "Mobile number",
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  autoComplete = "tel-national",
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}) {
  const described = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
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
      <div className="flex gap-2">
        <span className="num inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[12px] border border-line bg-cream px-3 text-[16px] font-semibold text-ink">
          <Icon name="phone" size={16} />
          {PHONE_PREFIX}
          <span className="sr-only">Malaysia country code, already filled in</span>
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          required={required}
          value={value}
          placeholder="12-345 6789"
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "num h-12 w-full rounded-[12px] border bg-white px-3.5 text-[16px] text-ink placeholder:text-grey/70 transition-colors focus:border-ink",
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
/* Password strength — requirements are always visible                 */
/* ------------------------------------------------------------------ */

export const PASSWORD_RULES: { id: string; label: string; test: (v: string) => boolean }[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  {
    id: "case",
    label: "One uppercase and one lowercase letter",
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "At least one number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "At least one symbol, like ! or #", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordScore(value: string): number {
  return PASSWORD_RULES.filter((r) => r.test(value)).length;
}

const STRENGTH_LABEL = ["Not strong enough", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_BAR = ["bg-ink/10", "bg-cta", "bg-yellow", "bg-teal", "bg-deep"];

export function PasswordStrength({ id, value }: { id: string; value: string }) {
  const score = passwordScore(value);
  return (
    <div id={id} className="rounded-[12px] border border-line bg-cream/70 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] font-bold uppercase tracking-wide text-grey">
          Password strength
        </span>
        <span className="text-[13px] font-bold text-ink" aria-live="polite">
          {value.length === 0 ? "Nothing typed yet" : STRENGTH_LABEL[score]}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < score ? STRENGTH_BAR[score] : "bg-ink/10",
            )}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-2 text-[13px] leading-snug",
                met ? "font-medium text-deep" : "text-grey",
              )}
            >
              <Icon name={met ? "check" : "cross"} size={14} />
              <span>{rule.label}</span>
              <span className="sr-only">{met ? " — done" : " — still needed"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox row — 44px target, description linked to the input         */
/* ------------------------------------------------------------------ */

export function CheckboxRow({
  id,
  checked,
  onChange,
  title,
  description,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  error?: string;
}) {
  const described = [description ? `${id}-desc` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <div
        className={cn(
          "flex min-h-11 items-start gap-3 rounded-[12px] border bg-white p-3.5",
          error ? "border-cta" : "border-line",
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={described || undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-cta)]"
        />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block cursor-pointer text-[15px] font-medium text-ink">
            {title}
          </label>
          {description && (
            <p id={`${id}-desc`} className="mt-0.5 text-[13px] leading-snug text-grey">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium leading-snug text-cta"
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
