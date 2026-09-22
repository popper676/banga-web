"use client";

import { TextField } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";

export interface CardFields {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export type CardErrors = Partial<Record<keyof CardFields, string>>;

export const EMPTY_CARD: CardFields = { number: "", name: "", expiry: "", cvv: "" };

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Standard Luhn checksum — the same check a real gateway runs client-side. */
function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function validateCard(fields: CardFields, now: Date = new Date()): CardErrors {
  const errors: CardErrors = {};
  const digits = fields.number.replace(/\D/g, "");

  if (digits.length === 0) {
    errors.number = "Enter the 16-digit number on the front of your card.";
  } else if (digits.length < 16) {
    errors.number = "This card number is too short — it should be 16 digits.";
  } else if (!luhn(digits)) {
    errors.number = "This card number is not valid. Check the digits and try again.";
  }

  if (!fields.name.trim()) {
    errors.name = "Enter the cardholder name exactly as printed on the card.";
  }

  const match = /^(\d{2})\/(\d{2})$/.exec(fields.expiry);
  if (!match) {
    errors.expiry = "Enter the expiry date as MM/YY.";
  } else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) {
      errors.expiry = "The expiry month must be between 01 and 12.";
    } else {
      const endOfMonth = new Date(year, month, 1);
      if (endOfMonth <= now) errors.expiry = "This card has expired. Use a card that is still valid.";
    }
  }

  if (fields.cvv.replace(/\D/g, "").length < 3) {
    errors.cvv = "Enter the 3-digit security code from the back of the card.";
  }

  return errors;
}

export function maskCard(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `•••• ${digits.slice(-4) || "0000"}`;
}

/**
 * Visa card fields. Values live in component state only — this prototype has
 * no gateway, no server and no storage for card data.
 */
export function PaymentCardForm({
  fields,
  errors,
  disabled,
  saveCard,
  onChange,
  onBlur,
  onSaveCardChange,
}: {
  fields: CardFields;
  errors: CardErrors;
  disabled?: boolean;
  saveCard: boolean;
  onChange: (patch: Partial<CardFields>) => void;
  onBlur: (field: keyof CardFields) => void;
  onSaveCardChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Card number"
        required
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="4242 4242 4242 4242"
        iconStart="card"
        disabled={disabled}
        value={fields.number}
        error={errors.number}
        onChange={(e) => onChange({ number: formatCardNumber(e.target.value) })}
        onBlur={() => onBlur("number")}
      />
      <TextField
        label="Cardholder name"
        required
        autoComplete="cc-name"
        placeholder="Name as printed on the card"
        disabled={disabled}
        value={fields.name}
        error={errors.name}
        onChange={(e) => onChange({ name: e.target.value })}
        onBlur={() => onBlur("name")}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Expiry date"
          required
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          maxLength={5}
          disabled={disabled}
          value={fields.expiry}
          error={errors.expiry}
          onChange={(e) => onChange({ expiry: formatExpiry(e.target.value) })}
          onBlur={() => onBlur("expiry")}
        />
        <TextField
          label="Security code (CVV)"
          required
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="123"
          maxLength={4}
          hint="3 digits on the back of the card."
          disabled={disabled}
          value={fields.cvv}
          error={errors.cvv}
          onChange={(e) => onChange({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          onBlur={() => onBlur("cvv")}
        />
      </div>

      <p className="flex items-start gap-2 rounded-[12px] bg-mint p-3 text-[13px] leading-snug text-deep">
        <span className="mt-px shrink-0">
          <Icon name="lock" size={15} />
        </span>
        Your card details are encrypted and sent straight to the bank. BANG GA BANG GA never sees
        or stores your card number.
      </p>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={saveCard}
          disabled={disabled}
          onChange={(e) => onSaveCardChange(e.target.checked)}
          className="size-5 shrink-0 accent-[var(--color-cta)]"
        />
        <span className="text-[14px] text-ink">Save this card for next time</span>
      </label>
    </div>
  );
}
