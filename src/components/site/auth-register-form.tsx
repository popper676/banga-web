"use client";

/**
 * Create-account flow. UI only.
 *
 * There is no auth service in this prototype: nothing typed here is stored,
 * hashed or transmitted. "Creating an account" flips the `signedIn`
 * simulation flag in the in-memory store and nothing else. The one-time code
 * step is a mock — the code is always 123456.
 */

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { MOCK_USER } from "@/lib/mock-data";
import { countdown } from "@/lib/format";
import { useStore } from "@/lib/store";
import { TextField } from "@/components/ui/forms";
import { Badge, Button, ButtonLink, Callout, Panel } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import {
  CheckboxRow,
  ErrorSummary,
  PasswordStrength,
  PhoneField,
  fullPhone,
  nationalDigits,
  passwordScore,
  phoneError,
  type FieldError,
} from "./auth-fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_CODE = "123456";
/** The real rule we show in the copy. Fast-forward only compresses the ticks. */
const RESEND_SECONDS = 60;
const SUMMARY_ID = "register-error-summary";

type Step = "details" | "verify" | "done";

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

const FIELD_ID: Record<keyof Errors, string> = {
  name: "register-name",
  email: "register-email",
  phone: "register-phone",
  password: "register-password",
  confirm: "register-confirm",
  terms: "register-terms",
};

export function RegisterForm() {
  const { sim, patchSim, patchDraft, pushToast } = useStore();

  const [step, setStep] = useState<Step>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [terms, setTerms] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const [verifyError, setVerifyError] = useState<string>();
  const [secondsLeft, setSecondsLeft] = useState(0);

  /* Resend countdown. Fast-forward keeps the 60-second rule but ticks 15×. */
  useEffect(() => {
    if (step !== "verify") return;
    const tick = window.setInterval(
      () => setSecondsLeft((s) => (s <= 0 ? 0 : s - 1)),
      sim.fastForward ? 67 : 1000,
    );
    return () => window.clearInterval(tick);
  }, [step, sim.fastForward]);

  const errors: Errors = {
    name: name.trim().length < 2 ? "Enter the name we should put on your orders." : undefined,
    email: EMAIL_RE.test(email.trim())
      ? undefined
      : "Enter an email address, like you@example.com.",
    phone: phoneError(phone),
    password:
      password.length === 0
        ? "Create a password."
        : passwordScore(password) < 3
          ? "Your password needs to meet at least three of the four requirements below."
          : undefined,
    confirm:
      confirm.length === 0
        ? "Type your password a second time."
        : confirm !== password
          ? "The two passwords do not match."
          : undefined,
    terms: terms ? undefined : "Accept the terms of service to create an account.",
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
    setTakenEmail(null);

    if (Object.values(errors).some(Boolean)) {
      window.setTimeout(() => document.getElementById(SUMMARY_ID)?.focus(), 0);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      // Simulated server rejection so the "already registered" state is reviewable.
      if (email.trim().toLowerCase() === MOCK_USER.email) {
        setTakenEmail(email.trim());
        window.setTimeout(() => document.getElementById("register-taken")?.focus(), 0);
        return;
      }
      setStep("verify");
      setSecondsLeft(RESEND_SECONDS);
      pushToast({
        tone: "neutral",
        title: "Verification code sent",
        body: "Prototype: the code is always 123456.",
      });
    }, 900);
  };

  const onVerify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifyError(undefined);
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the six-digit code we sent you.");
      return;
    }
    setCodeError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (code !== OTP_CODE) {
        setVerifyError("That code is not right, or it has expired. Ask for a new one.");
        return;
      }
      patchSim({ signedIn: true });
      patchDraft({
        contactName: name.trim(),
        contactPhone: fullPhone(phone),
        contactEmail: email.trim(),
        createAccount: false,
      });
      pushToast({
        tone: "success",
        title: "Account created",
        body: `Welcome to BANG GA BANG GA, ${name.trim().split(" ")[0]}.`,
      });
      setStep("done");
    }, 900);
  };

  /* ---------------------------------------------------------------- */
  /* Step 3 — created                                                  */
  /* ---------------------------------------------------------------- */

  if (step === "done") {
    return (
      <Panel className="mt-6 p-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-mint text-deep">
          <Icon name="check" size={22} />
        </span>
        <h2 className="mt-3 text-[24px]">You&rsquo;re in, {name.trim().split(" ")[0]}</h2>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-ink/80">
          Your email is verified. Your addresses, receipts and orders now stay in one place.
        </p>

        <ul className="mt-5 flex flex-col gap-2.5 text-[15px] text-ink/85">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-deep">
              <Icon name="pin" size={17} />
            </span>
            Save a delivery address so checkout is two taps next time.
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-deep">
              <Icon name="bell" size={17} />
            </span>
            {marketing
              ? "You opted in to offers. You can change that any time in notifications."
              : "You are only getting order updates. Offers stay off until you turn them on."}
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-deep">
              <Icon name="camera" size={17} />
            </span>
            Member benefits start with your first completed order.
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink href="/account" size="lg" iconEnd="arrowRight">
            Go to my account
          </ButtonLink>
          <ButtonLink href="/menu" variant="secondary" size="lg">
            Start an order
          </ButtonLink>
          <ButtonLink href="/account/addresses" variant="ghost" size="lg">
            Add an address
          </ButtonLink>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-grey">
          Prototype only — no account was created, no password was stored and no email was sent.
        </p>
      </Panel>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 2 — one-time code                                            */
  /* ---------------------------------------------------------------- */

  if (step === "verify") {
    return (
      <>
        <Callout tone="success" icon="check" title="Check your inbox" className="mt-6">
          We sent a six-digit code to{" "}
          <strong className="font-semibold">{email.trim()}</strong>. It is valid for ten minutes and
          can only be used once. Nothing is created until you enter it.
        </Callout>

        {verifyError && (
          <div
            role="alert"
            className="mt-5 flex gap-3 rounded-[14px] border border-cta/35 bg-cta/8 p-4"
          >
            <span className="mt-0.5 shrink-0 text-cta">
              <Icon name="alert" size={18} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-ink">We could not verify that code</p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{verifyError}</p>
            </div>
          </div>
        )}

        <Panel className="mt-5 p-6">
          <h2 className="text-[20px]">Enter your verification code</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
            Sent to {email.trim()} · not the right address?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setCode("");
                setVerifyError(undefined);
              }}
              className="min-h-11 font-semibold text-deep underline underline-offset-2"
            >
              Change it
            </button>
          </p>

          <form noValidate onSubmit={onVerify} className="mt-5 flex flex-col gap-5">
            <TextField
              id="register-otp"
              label="Six-digit code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="num tracking-[0.4em]"
              value={code}
              error={codeError}
              hint="Prototype: the code is 123456."
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />

            <Button type="submit" size="lg" full loading={loading}>
              {loading ? "Checking your code" : "Verify and create my account"}
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <Button
              variant="secondary"
              disabled={secondsLeft > 0}
              iconStart="refund"
              onClick={() => {
                setSecondsLeft(RESEND_SECONDS);
                setCode("");
                setCodeError(undefined);
                setVerifyError(undefined);
                pushToast({
                  tone: "neutral",
                  title: "New code sent",
                  body: "Prototype: still 123456.",
                });
              }}
            >
              Send a new code
            </Button>
            <p className="num text-[13px] text-grey" aria-live="polite">
              {secondsLeft > 0
                ? `You can ask for a new code in ${countdown(secondsLeft)}`
                : "You can ask for a new code now"}
            </p>
          </div>
          {sim.fastForward && (
            <p className="mt-2 text-[12px] leading-snug text-grey">
              The real wait is 60 seconds. Fast-forward is on, so the prototype counts down 15 times
              faster.
            </p>
          )}
        </Panel>
      </>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 1 — details                                                  */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <Callout tone="info" icon="sparkle" title="Prototype sign-up" className="mt-6">
        Any details work and nothing is saved. Use{" "}
        <strong className="font-semibold">{MOCK_USER.email}</strong> to see the &ldquo;email already
        registered&rdquo; error, and the code{" "}
        <strong className="font-semibold">{OTP_CODE}</strong> to finish. No password is ever stored,
        hashed or sent.
      </Callout>

      {takenEmail && (
        <div
          id="register-taken"
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-[14px] border border-cta/35 bg-cta/8 p-4"
        >
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Icon name="alert" size={17} />
            That email already has an account
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink/80">
            <span className="font-semibold">{takenEmail}</span> is already registered with us. Sign
            in instead, or use a one-time code if you have forgotten the password.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink href="/login" size="md">
              Sign in with this email
            </ButtonLink>
            <ButtonLink href="/guest" variant="secondary" size="md">
              Continue as guest
            </ButtonLink>
          </div>
        </div>
      )}

      <div className="mt-5">
        <ErrorSummary
          id={SUMMARY_ID}
          errors={summaryErrors}
          intro="Each item below is a link that takes you straight to the field."
        />
      </div>

      <Panel className="mt-5 p-6">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          <TextField
            id={FIELD_ID.name}
            label="Full name"
            required
            autoComplete="name"
            iconStart="user"
            placeholder="Aisyah Rahman"
            value={name}
            error={show("name")}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />

          <TextField
            id={FIELD_ID.email}
            label="Email address"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            hint="Receipts, refund confirmations and your tracking links go here."
            value={email}
            error={show("email")}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />

          <PhoneField
            id={FIELD_ID.phone}
            label="Mobile number"
            required
            value={phone}
            error={show("phone")}
            hint={
              nationalDigits(phone).length >= 9
                ? `We will save this as ${fullPhone(phone)}.`
                : "Malaysian mobile number. The branch and the rider call this number."
            }
            onChange={setPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          />

          <div className="flex flex-col gap-3">
            <TextField
              id={FIELD_ID.password}
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              iconStart="lock"
              hint="At least 8 characters, with letters, a number and a symbol. The checklist below updates as you type."
              value={password}
              error={show("password")}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-deep hover:bg-mint"
                >
                  <Icon name="eye" size={15} />
                  {showPassword ? "Hide" : "Show"}
                  <span className="sr-only"> password</span>
                </button>
              }
            />
            <PasswordStrength id="register-password-strength" value={password} />
          </div>

          <TextField
            id={FIELD_ID.confirm}
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            iconStart="lock"
            hint="Both passwords must match exactly."
            value={confirm}
            error={show("confirm")}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          />

          <div className="flex flex-col gap-3">
            <CheckboxRow
              id="register-marketing"
              checked={marketing}
              onChange={setMarketing}
              title="Email me offers, new menu items and photo booth news"
              description="About twice a month. Order updates are sent either way — you can change this any time in your notification settings."
            />
            <CheckboxRow
              id={FIELD_ID.terms}
              checked={terms}
              onChange={(v) => {
                setTerms(v);
                setTouched((t) => ({ ...t, terms: true }));
              }}
              error={show("terms")}
              title={
                <>
                  I accept the{" "}
                  <Link
                    href="/legal/terms"
                    className="font-semibold text-deep underline underline-offset-2"
                  >
                    terms of service
                  </Link>
                </>
              }
              description={
                <>
                  Including how we handle your details in the{" "}
                  <Link
                    href="/legal/privacy"
                    className="font-semibold text-deep underline underline-offset-2"
                  >
                    privacy policy
                  </Link>{" "}
                  and the rules in our{" "}
                  <Link
                    href="/legal/refund-policy"
                    className="font-semibold text-deep underline underline-offset-2"
                  >
                    refund policy
                  </Link>
                  .
                </>
              }
            />
          </div>

          {sim.offline && (
            <Callout tone="warning" icon="wifiOff" title="You are offline">
              Creating an account needs a connection. Nothing you have typed will be lost — try
              again once you reconnect.
            </Callout>
          )}

          <Button type="submit" size="lg" full loading={loading} disabled={sim.offline}>
            {loading ? "Creating your account" : "Create my account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[12px] font-semibold uppercase tracking-wide text-grey">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="w-full text-[13px] text-grey">
            Social sign-in is drawn for review only — these buttons are not connected to any
            provider.
          </p>
          {["Google", "Apple"].map((provider) => (
            <Button
              key={provider}
              variant="secondary"
              size="md"
              iconStart="shield"
              onClick={() =>
                pushToast({
                  tone: "neutral",
                  title: `${provider} sign-in is not wired up`,
                  body: "This prototype has no auth provider. Use the form above instead.",
                })
              }
            >
              Continue with {provider}
            </Button>
          ))}
          <Badge tone="warning" soft icon="alert">
            Prototype only
          </Badge>
        </div>
      </Panel>

      <div className="mt-6 rounded-[16px] border border-dashed border-line bg-white p-5">
        <h2 className="text-[17px]">Already have an account, or not ready for one?</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
          You never need an account to order. Guest checkout gives you a tracking code, and you can
          upgrade to an account afterwards in one step.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/login" variant="secondary">
            Sign in instead
          </ButtonLink>
          <ButtonLink href="/guest" variant="ghost" iconEnd="arrowRight">
            Continue as guest
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
