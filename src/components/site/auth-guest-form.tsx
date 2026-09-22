"use client";

/**
 * Guest checkout details. UI only.
 *
 * Nothing is stored beyond the in-memory checkout draft, and "continuing as a
 * guest" simply turns the `signedIn` simulation flag off.
 */

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { branchById } from "@/lib/mock-data";
import { etaRange } from "@/lib/format";
import { useStore } from "@/lib/store";
import { TextField } from "@/components/ui/forms";
import { Button, ButtonLink, Callout, Panel } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import {
  CheckboxRow,
  ErrorSummary,
  PhoneField,
  fullPhone,
  nationalDigits,
  phoneError,
  type FieldError,
} from "./auth-fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUMMARY_ID = "guest-error-summary";

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
}

const FIELD_ID: Record<keyof Errors, string> = {
  name: "guest-name",
  phone: "guest-phone",
  email: "guest-email",
};

export function GuestForm() {
  const router = useRouter();
  const { draft, patchDraft, patchSim, pushToast, sim, cartCount, branchId, hydrated } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [upgradeLater, setUpgradeLater] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const branch = branchById(branchId);

  const errors: Errors = {
    name: name.trim().length < 2 ? "Enter the name for this order." : undefined,
    phone: phoneError(phone),
    email: EMAIL_RE.test(email.trim())
      ? undefined
      : "Enter an email address so we can send your receipt and tracking link.",
  };

  const show = (key: keyof Errors) => (submitted || touched[key] ? errors[key] : undefined);

  const summaryErrors: FieldError[] = submitted
    ? (Object.keys(FIELD_ID) as (keyof Errors)[])
        .filter((key) => errors[key])
        .map((key) => ({ fieldId: FIELD_ID[key], message: errors[key] as string }))
    : [];

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      window.setTimeout(() => document.getElementById(SUMMARY_ID)?.focus(), 0);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      patchSim({ signedIn: false });
      patchDraft({
        contactName: name.trim(),
        contactPhone: fullPhone(phone),
        contactEmail: email.trim(),
        createAccount: upgradeLater,
      });
      pushToast({
        tone: "success",
        title: "Guest details saved",
        body: `We will text your tracking code to ${fullPhone(phone)}.`,
      });
      router.push("/checkout");
    }, 700);
  };

  return (
    <>
      <Callout tone="info" icon="sparkle" title="Prototype guest checkout" className="mt-6">
        Nothing typed here leaves your browser. The details only fill the in-memory checkout draft so
        the rest of the flow reads realistically.
      </Callout>

      <div className="mt-5">
        <ErrorSummary
          id={SUMMARY_ID}
          errors={summaryErrors}
          intro="Each item below is a link that takes you straight to the field."
        />
      </div>

      <Panel className="mt-5 p-6">
        <h2 className="text-[20px]">Your details for this order</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
          Three fields, then straight to checkout. The branch needs a name and a number; the email is
          where your receipt and tracking link go.
        </p>

        <form noValidate onSubmit={onSubmit} className="mt-5 flex flex-col gap-5">
          <TextField
            id={FIELD_ID.name}
            label="Name"
            required
            autoComplete="name"
            iconStart="user"
            hint="Whatever the branch should call out when your order is ready."
            value={name}
            error={show("name")}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />

          <PhoneField
            id={FIELD_ID.phone}
            label="Mobile number"
            required
            value={phone}
            error={show("phone")}
            hint={
              nationalDigits(phone).length >= 9
                ? `Tracking code goes to ${fullPhone(phone)}.`
                : "The branch and the rider call this number. Your tracking code is texted here."
            }
            onChange={setPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          />

          <TextField
            id={FIELD_ID.email}
            label="Email address"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            hint="Receipt, tracking link and any refund confirmation."
            value={email}
            error={show("email")}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />

          <CheckboxRow
            id="guest-upgrade"
            checked={upgradeLater}
            onChange={setUpgradeLater}
            title="Offer me an account after this order"
            description="After you collect or receive your food we will email a one-tap link that turns this order into an account — your address and receipt come with it. Nothing changes about this order if you ignore it."
          />

          {sim.offline && (
            <Callout tone="warning" icon="wifiOff" title="You are offline">
              Checkout needs a connection so we can hold your branch slot and price the delivery.
              Your details and your cart stay on this device.
            </Callout>
          )}

          <Button
            type="submit"
            size="lg"
            full
            loading={loading}
            disabled={sim.offline}
            iconEnd="arrowRight"
          >
            {loading ? "Taking you to checkout" : "Continue to checkout"}
          </Button>

          <p className="text-[13px] leading-relaxed text-grey">
            {hydrated && cartCount > 0 ? (
              <>
                You have{" "}
                <span className="num font-semibold text-ink">
                  {cartCount} item{cartCount === 1 ? "" : "s"}
                </span>{" "}
                in your cart from {branch.shortName} · {etaRange(branch, draft.fulfilment)}.
              </>
            ) : (
              <>
                Your cart is empty at the moment. You can still save these details — checkout will
                ask you to add something from the menu first.
              </>
            )}
          </p>
        </form>
      </Panel>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[16px] border border-dashed border-line bg-white p-5">
          <h2 className="text-[17px]">Already have an account?</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
            Sign in and your addresses, receipts and stamps are already there.
          </p>
          <ButtonLink href="/login" variant="secondary" className="mt-4">
            Sign in
          </ButtonLink>
        </div>
        <div className="rounded-[16px] border border-dashed border-line bg-white p-5">
          <h2 className="text-[17px]">Rather set one up now?</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
            It adds about a minute and you keep everything from this order.
          </p>
          <ButtonLink href="/register" variant="ghost" iconEnd="arrowRight" className="mt-4">
            Create an account
          </ButtonLink>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-[13px] leading-relaxed text-grey">
        <span className="mt-0.5 shrink-0 text-deep">
          <Icon name="shield" size={15} />
        </span>
        We keep guest order details only as long as we need them for the order and our tax records.
        Read the privacy policy for the detail.
      </p>
    </>
  );
}
