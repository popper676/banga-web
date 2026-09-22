"use client";

/**
 * Promo codes are validated against PROMOTIONS the moment they are entered:
 * branch scope, minimum spend and whether the code exists at all. The same
 * three rules run again on every total, so a code that stops qualifying says
 * so instead of silently dropping off.
 */

import { useState } from "react";
import { PROMOTIONS, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, Button } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";

const SAMPLE_CODES = PROMOTIONS.filter((p) => p.code).map((p) => p.code as string);

export function CartPromoField() {
  const { draft, patchDraft, totals, branchId, pushToast } = useStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [announcement, setAnnouncement] = useState("");

  const branch = branchById(branchId);
  const applied = PROMOTIONS.find((p) => p.code && p.code === draft.promotionCode);

  const scopeOk = applied ? applied.branchIds.includes(branchId) : true;
  const spendOk = applied ? totals.subtotal >= applied.minSpend : true;
  const stillValid = Boolean(applied) && scopeOk && spendOk;

  const branchNames = (ids: string[]) => ids.map((id) => branchById(id).shortName).join(" and ");

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    const code = value.trim().toUpperCase();

    if (!code) {
      setError("Enter a promo code first.");
      setAnnouncement("Enter a promo code first.");
      return;
    }

    const promo = PROMOTIONS.find((p) => p.code === code);
    if (!promo) {
      const message = `We don’t recognise “${code}”. Check the code on the promotions page — codes are not case sensitive.`;
      setError(message);
      setAnnouncement(message);
      return;
    }
    if (!promo.branchIds.includes(branchId)) {
      const message = `${promo.code} only runs at ${branchNames(promo.branchIds)}. You are ordering from ${branch.shortName}.`;
      setError(message);
      setAnnouncement(message);
      return;
    }
    if (totals.subtotal < promo.minSpend) {
      const message = `${promo.code} needs a subtotal of ${money(promo.minSpend)}. Add ${money(promo.minSpend - totals.subtotal)} more to use it.`;
      setError(message);
      setAnnouncement(message);
      return;
    }

    patchDraft({ promotionCode: promo.code ?? null });
    setValue("");
    setError(undefined);
    setAnnouncement(`${promo.name} applied. ${promo.description}`);
    pushToast({ tone: "success", title: `${promo.name} applied`, body: promo.description });
  };

  const removeCode = () => {
    const name = applied?.name ?? "Promotion";
    patchDraft({ promotionCode: null });
    setAnnouncement(`${name} removed.`);
    pushToast({ tone: "neutral", title: `${name} removed` });
  };

  return (
    <div className="border-t border-line pt-4">
      <h3 className="flex items-center gap-2 text-[15px]">
        <Icon name="tag" size={15} />
        Promo code
      </h3>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {applied ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-deep/25 bg-mint p-3">
            <Badge tone="warning">{applied.badge}</Badge>
            <div className="min-w-0 flex-1">
              <p className="num text-[14px] font-semibold text-ink">
                {applied.code} · {applied.name}
              </p>
              <p className="text-[12px] leading-snug text-deep">{applied.description}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={removeCode} className="min-h-11">
              Remove
              <span className="sr-only"> promo code {applied.code}</span>
            </Button>
          </div>

          {!stillValid && (
            <p
              role="alert"
              className="mt-2 flex items-start gap-1.5 text-[12px] font-medium leading-snug text-cta"
            >
              <span className="mt-px shrink-0">
                <Icon name="alert" size={13} />
              </span>
              {!scopeOk
                ? `${applied.code} does not run at ${branch.shortName}, so it is not applied to this total.`
                : `${applied.code} needs a subtotal of ${money(applied.minSpend)}. Add ${money(applied.minSpend - totals.subtotal)} more or remove the code.`}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={apply} className="mt-3 flex flex-wrap items-start gap-2">
          <TextField
            label="Have a code?"
            wrapperClassName="min-w-44 flex-1"
            placeholder="STUDENT10"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={value}
            error={error}
            hint={`Prototype codes: ${SAMPLE_CODES.join(", ")}`}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(undefined);
            }}
          />
          <Button type="submit" variant="secondary" className="mt-6 shrink-0">
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}
