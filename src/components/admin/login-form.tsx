"use client";

/**
 * Simulated admin sign-in. There is no auth service in this prototype —
 * the accepted credentials are the mock admin users in src/lib/mock-data.ts
 * and the two-factor code is fixed. Nothing is stored anywhere.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ADMIN_USERS, BRANCHES } from "@/lib/mock-data";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/icons";
import { Button, Callout, Badge } from "@/components/ui/primitives";
import { SelectField, TextField, Toggle } from "@/components/ui/forms";
import { PhotoStrip } from "@/components/ui/media";
import { LiveAnnouncer, PrototypeNote } from "@/components/admin/ops-shared";

const DEMO_PASSWORD = "bangga2026";
const DEMO_CODE = "204815";
const MAX_ATTEMPTS = 3;
const RESEND_SECONDS = 30;

type Step = "credentials" | "twoFactor";

export function AdminLoginForm() {
  const router = useRouter();
  const { pushToast, sim } = useStore();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState("all");
  const [remember, setRemember] = useState(true);

  const [failures, setFailures] = useState(0);
  const [error, setError] = useState<"credentials" | "locked" | "inactive" | "code" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const matchedUser = ADMIN_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  const lockedBranch = matchedUser?.branchId ?? null;
  const locked = failures >= MAX_ATTEMPTS;

  /* Branch scope follows the role: branch-scoped staff cannot widen it. */
  useEffect(() => {
    if (lockedBranch) setBranch(lockedBranch);
  }, [lockedBranch]);

  /* Resend countdown on the two-factor step. */
  useEffect(() => {
    if (step !== "twoFactor" || resendIn <= 0) return;
    const id = window.setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [step, resendIn]);

  const code = digits.join("");

  function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setSubmitting(true);
    setError(null);

    window.setTimeout(() => {
      setSubmitting(false);

      if (matchedUser && !matchedUser.active) {
        setError("inactive");
        setAnnouncement("This account has been deactivated. Ask a Super Admin to re-enable it.");
        return;
      }

      if (!matchedUser || password !== DEMO_PASSWORD) {
        const next = failures + 1;
        setFailures(next);
        setError(next >= MAX_ATTEMPTS ? "locked" : "credentials");
        setAnnouncement(
          next >= MAX_ATTEMPTS
            ? "Account locked after three failed attempts."
            : `Email or password is incorrect. ${MAX_ATTEMPTS - next} attempts left before the account locks.`,
        );
        setPassword("");
        return;
      }

      setStep("twoFactor");
      setResendIn(RESEND_SECONDS);
      setAnnouncement(`Verification code sent to ${maskedDestination(matchedUser.email)}.`);
    }, 550);
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    window.setTimeout(() => {
      setSubmitting(false);
      if (code !== DEMO_CODE) {
        setError("code");
        setAnnouncement("That code is not correct. Check the six digits and try again.");
        setDigits(["", "", "", "", "", ""]);
        digitRefs.current[0]?.focus();
        return;
      }
      pushToast({
        tone: "success",
        title: `Signed in as ${matchedUser?.name ?? "Admin"}`,
        body: remember
          ? "This device is remembered for 30 days (simulated)."
          : "You will be asked for a code again next time.",
      });
      router.push("/admin");
    }, 550);
  }

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      // Pasted code — spread it across the boxes.
      const next = [...digits];
      for (let i = 0; i < 6 - index; i++) next[index + i] = clean[i] ?? "";
      setDigits(next);
      digitRefs.current[Math.min(5, index + clean.length)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 5) digitRefs.current[index + 1]?.focus();
  }

  function onDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      digitRefs.current[index - 1]?.focus();
      setDigits((d) => d.map((v, i) => (i === index - 1 ? "" : v)));
    }
    if (e.key === "ArrowLeft" && index > 0) digitRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) digitRefs.current[index + 1]?.focus();
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <LiveAnnouncer message={announcement} assertive={error !== null} />

      <BrandPanel />

      <div className="flex flex-1 items-center justify-center bg-cream px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-7">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-deep">
              Admin console
            </p>
            <h1 className="mt-2 text-[clamp(26px,3.4vw,34px)] leading-tight">
              {step === "credentials" ? "Sign in to operations" : "Enter your verification code"}
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-grey">
              {step === "credentials"
                ? "Order confirmation, kitchen status, delivery and reporting for both branches."
                : `We sent a 6-digit code to ${maskedDestination(email)}. It expires in 10 minutes.`}
            </p>
          </div>

          {sim.offline && (
            <Callout tone="warning" icon="wifiOff" title="You appear to be offline" className="mb-5">
              Sign-in needs a connection. Turn the offline switch off in the prototype panel to
              continue.
            </Callout>
          )}

          {error === "credentials" && (
            <Callout tone="danger" title="Email or password is incorrect" className="mb-5" role="alert">
              {MAX_ATTEMPTS - failures} more failed{" "}
              {MAX_ATTEMPTS - failures === 1 ? "attempt" : "attempts"} will lock this account for 15
              minutes.
            </Callout>
          )}

          {error === "inactive" && (
            <Callout tone="danger" title="This account is deactivated" className="mb-5" role="alert">
              Idris Hassan was deactivated on 20 September. A Super Admin can re-enable the account
              under Admins &amp; roles.
            </Callout>
          )}

          {error === "locked" && (
            <Callout tone="danger" icon="lock" title="Account locked" className="mb-5" role="alert">
              Three failed attempts. For security this account is locked for 15 minutes. A Super
              Admin can unlock it immediately from Admins &amp; roles, or call the branch owner on{" "}
              <span className="num whitespace-nowrap">+60 3-5612 8840</span>.
            </Callout>
          )}

          {error === "code" && (
            <Callout tone="danger" title="That code did not match" className="mb-5" role="alert">
              Check the six digits from your authenticator app, or resend a new code.
            </Callout>
          )}

          {step === "credentials" ? (
            <form onSubmit={submitCredentials} className="flex flex-col gap-4" noValidate>
              <TextField
                label="Work email"
                type="email"
                name="email"
                autoComplete="username"
                required
                iconStart="user"
                placeholder="you@bangga.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={locked}
              />

              <div className="relative">
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  iconStart="lock"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={locked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-9 flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[12.5px] font-semibold text-deep hover:bg-mint"
                >
                  <Icon name="eye" size={14} />
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <SelectField
                label="Branch"
                value={branch}
                onChange={(e) => setBranch((e.target as HTMLSelectElement).value)}
                disabled={locked || Boolean(lockedBranch)}
                hint={
                  lockedBranch
                    ? `${matchedUser?.role} accounts are locked to ${
                        BRANCHES.find((b) => b.id === lockedBranch)?.shortName
                      }.`
                    : "Super Admin and Finance can work across both branches."
                }
                options={[
                  { value: "all", label: "All branches" },
                  ...BRANCHES.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />

              <div className="rounded-[12px] border border-line bg-white px-3.5 py-1">
                <Toggle
                  checked={remember}
                  onChange={setRemember}
                  label="Remember this device for 30 days"
                  description="Skips the verification code on this browser. Do not use on a shared terminal at the counter."
                />
              </div>

              <Button type="submit" size="lg" full loading={submitting} disabled={locked || sim.offline}>
                {locked ? "Account locked" : "Continue"}
              </Button>

              <RoleNote />
              <DemoHint />
            </form>
          ) : (
            <form onSubmit={submitCode} className="flex flex-col gap-5" noValidate>
              <fieldset className="border-0 p-0">
                <legend className="mb-2 text-[13px] font-semibold text-ink">
                  6-digit verification code
                </legend>
                <div className="flex gap-2">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        digitRefs.current[i] = el;
                      }}
                      value={d}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => onDigitKeyDown(i, e)}
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      aria-label={`Digit ${i + 1} of 6`}
                      aria-invalid={error === "code" ? true : undefined}
                      className={cn(
                        "num h-14 w-full rounded-[12px] border bg-white text-center text-[22px] font-bold text-ink",
                        error === "code" ? "border-cta" : "border-line focus:border-ink",
                      )}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  iconStart="refund"
                  disabled={resendIn > 0}
                  onClick={() => {
                    setResendIn(RESEND_SECONDS);
                    setResendCount((c) => c + 1);
                    setDigits(["", "", "", "", "", ""]);
                    setError(null);
                    setAnnouncement("A new verification code has been sent.");
                    digitRefs.current[0]?.focus();
                  }}
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                </Button>
                {resendCount > 0 && (
                  <Badge tone="info" icon="check" soft>
                    Resent {resendCount}×
                  </Badge>
                )}
              </div>

              <Button type="submit" size="lg" full loading={submitting} disabled={code.length < 6}>
                Verify and open the console
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError(null);
                  setDigits(["", "", "", "", "", ""]);
                }}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 self-center text-[13.5px] font-semibold text-deep underline underline-offset-4"
              >
                <Icon name="chevronLeft" size={14} />
                Use a different account
              </button>

              <PrototypeNote>
                Prototype two-factor step — the code is always{" "}
                <span className="num font-semibold text-ink">{DEMO_CODE}</span> and no message is
                actually sent.
              </PrototypeNote>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function maskedDestination(email: string): string {
  const user = ADMIN_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return "your authenticator app";
  return user.role === "Super Admin" ? "+60 12-••• ••41" : "+60 1•-••• ••02";
}

function RoleNote() {
  return (
    <div className="rounded-[12px] border border-deep/25 bg-mint px-3.5 py-3">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <Icon name="shield" size={15} />
        What each role can see
      </p>
      <ul className="mt-1.5 flex flex-col gap-1 text-[12.5px] leading-snug text-ink/80">
        <li>
          <strong>Super Admin</strong> and <strong>Finance</strong> — both branches, payments,
          refunds and reports.
        </li>
        <li>
          <strong>Branch Managers</strong> and <strong>Branch Staff</strong> — only their own branch.
          Orders, customers and reports for other branches are hidden, not just filtered out.
        </li>
        <li>
          <strong>Kitchen</strong> — the kitchen status board for their branch only, with no money
          figures.
        </li>
      </ul>
    </div>
  );
}

function DemoHint() {
  return (
    <details className="rounded-[12px] border border-line bg-white px-3.5 py-3">
      <summary className="cursor-pointer text-[13px] font-semibold text-ink">
        Prototype credentials
      </summary>
      <div className="mt-2 flex flex-col gap-1.5 text-[12.5px] leading-snug text-grey">
        <p>
          Password for every account:{" "}
          <span className="num font-semibold text-ink">{DEMO_PASSWORD}</span>. Any other password
          shows the wrong-password error; three failures show the locked-account state.
        </p>
        <ul className="flex flex-col gap-1">
          {ADMIN_USERS.slice(0, 4).map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-1.5">
              <span className="num font-semibold text-ink">{u.email}</span>
              <span>· {u.role}</span>
            </li>
          ))}
          <li>
            <span className="num font-semibold text-ink">idris@bangga.my</span> · deactivated account
          </li>
        </ul>
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Left brand panel — Korean editorial, dark ink                       */
/* ------------------------------------------------------------------ */

function BrandPanel() {
  return (
    <aside className="on-dark relative isolate flex shrink-0 flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-cream lg:w-[46%] lg:max-w-[620px] lg:px-12 lg:py-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-deep/60"
      />
      <span
        aria-hidden
        className="deco-frame pointer-events-none absolute -bottom-16 -left-14 size-64 text-teal/25"
      />
      <div className="grain-layer" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[12px] bg-teal font-display text-[17px] font-extrabold text-ink">
            방
          </span>
          <div>
            <p className="font-display text-[15px] font-extrabold leading-tight">BANG GA BANG GA</p>
            <p className="text-[12px] text-cream/60">방가방가 · Nice to meet you</p>
          </div>
        </div>
      </div>

      <div className="relative mt-10 max-w-[30ch]">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-teal">
          Operations console
        </p>
        <p className="mt-4 font-display text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.02]">
          Confirm fast.
          <br />
          Cook hot.
          <br />
          <span className="text-teal">Hand it over.</span>
        </p>
        <p className="mt-5 text-[14.5px] leading-relaxed text-cream/75">
          Branch staff have five minutes to accept an order before it is auto-rejected and refunded.
          This console is built around that clock.
        </p>
      </div>

      <div className="relative mt-10 flex flex-wrap items-end gap-6">
        <PhotoStrip frames={3} tilt={-4} label="Photo booth strip motif" />
        <ul className="flex flex-col gap-2 text-[13px] text-cream/80">
          {BRANCHES.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <span className="text-teal">
                <Icon name="pin" size={14} />
              </span>
              {b.name}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="text-teal">
              <Icon name="shield" size={14} />
            </span>
            UI prototype · no live customer data
          </li>
        </ul>
      </div>
    </aside>
  );
}