"use client";

/**
 * UI only. There is no auth service in this prototype: nothing typed here is
 * stored, hashed or transmitted. "Signing in" flips a simulation flag in the
 * in-memory store and nothing else.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MOCK_USER } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { TextField } from "@/components/ui/forms";
import { Button, ButtonLink, Callout, Panel } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { PhotoStrip } from "@/components/ui/media";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Mode = "password" | "code-request" | "code-verify";

export default function LoginPage() {
  const router = useRouter();
  const { patchSim, pushToast } = useStore();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const succeed = () => {
    patchSim({ signedIn: true });
    pushToast({
      tone: "success",
      title: "Signed in",
      body: `Welcome back, ${MOCK_USER.name.split(" ")[0]}.`,
    });
    router.push("/account");
  };

  const onPasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(undefined);

    const nextEmailError = EMAIL_RE.test(email.trim())
      ? undefined
      : "Enter your email address, like you@example.com.";
    const nextPasswordError = password.length === 0 ? "Enter your password." : undefined;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      // Simulated failure path so the error state is reviewable.
      if (password === "wrongpass") {
        setFormError("That email and password do not match. Check your password and try again.");
        return;
      }
      succeed();
    }, 900);
  };

  const onCodeRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(undefined);
    const nextEmailError = EMAIL_RE.test(email.trim())
      ? undefined
      : "Enter your email address so we know where to send the code.";
    setEmailError(nextEmailError);
    if (nextEmailError) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setMode("code-verify");
      pushToast({
        tone: "neutral",
        title: "Code sent",
        body: "Prototype: use 123456 to continue.",
      });
    }, 900);
  };

  const onCodeVerify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(undefined);
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the six-digit code we sent you.");
      return;
    }
    setCodeError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (code !== "123456") {
        setFormError("That code is not right, or it has expired. Ask for a new one.");
        return;
      }
      succeed();
    }, 900);
  };

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        {/* Form column */}
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-[clamp(30px,5vw,48px)] leading-[1.02]">WELCOME BACK</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80">
            Sign in to reorder in two taps, track a live order and keep your saved addresses.
          </p>

          <Callout tone="info" icon="sparkle" title="Prototype sign-in" className="mt-6">
            Any email works. Use the password <strong className="font-semibold">wrongpass</strong> to
            see the error state, or the one-time code <strong className="font-semibold">123456</strong>.
            No credential is ever stored or sent.
          </Callout>

          {formError && (
            <div role="alert" className="mt-5 flex gap-3 rounded-[14px] border border-cta/35 bg-cta/8 p-4">
              <span className="mt-0.5 shrink-0 text-cta">
                <Icon name="alert" size={18} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink">We could not sign you in</p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{formError}</p>
              </div>
            </div>
          )}

          {mode === "password" && (
            <Panel className="mt-6 p-6">
              <form noValidate onSubmit={onPasswordSubmit} className="flex flex-col gap-5">
                <TextField
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  iconStart="user"
                  value={email}
                  error={emailError}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  iconStart="lock"
                  value={password}
                  error={passwordError}
                  onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-ink">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-5 accent-[var(--color-cta)]"
                    />
                    Remember me on this device
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("code-request");
                      setFormError(undefined);
                      setPasswordError(undefined);
                    }}
                    className="min-h-11 text-[14px] font-semibold text-deep underline underline-offset-2"
                  >
                    Forgot your password?
                  </button>
                </div>

                <Button type="submit" size="lg" full loading={loading}>
                  {loading ? "Signing in" : "Sign in"}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[12px] font-semibold uppercase tracking-wide text-grey">or</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <Button
                variant="secondary"
                size="lg"
                full
                iconStart="bell"
                onClick={() => {
                  setMode("code-request");
                  setFormError(undefined);
                }}
              >
                Send me a one-time code
              </Button>
            </Panel>
          )}

          {mode === "code-request" && (
            <Panel className="mt-6 p-6">
              <h2 className="text-[20px]">Sign in with a one-time code</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
                We will email you a six-digit code. It is valid for ten minutes and can be used
                once.
              </p>
              <form noValidate onSubmit={onCodeRequest} className="mt-5 flex flex-col gap-5">
                <TextField
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  iconStart="user"
                  value={email}
                  error={emailError}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" size="lg" full loading={loading}>
                  {loading ? "Sending the code" : "Send the code"}
                </Button>
                <Button type="button" variant="ghost" size="md" full onClick={() => setMode("password")}>
                  Use my password instead
                </Button>
              </form>
            </Panel>
          )}

          {mode === "code-verify" && (
            <Panel className="mt-6 p-6">
              <h2 className="text-[20px]">Enter your code</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
                We sent a six-digit code to{" "}
                <span className="font-semibold text-ink">{email}</span>. It expires in ten minutes.
              </p>
              <form noValidate onSubmit={onCodeVerify} className="mt-5 flex flex-col gap-5">
                <TextField
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
                  {loading ? "Checking the code" : "Sign in"}
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMode("code-request")}>
                    Send a new code
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMode("password")}>
                    Use my password instead
                  </Button>
                </div>
              </form>
            </Panel>
          )}

          <div className="mt-6 rounded-[16px] border border-dashed border-line bg-white p-5">
            <h2 className="text-[17px]">No account?</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-grey">
              You do not need one to order. Guest checkout gives you a tracking link by SMS, and you
              can create an account afterwards in one step.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/register" variant="secondary">
                Create an account
              </ButtonLink>
              <ButtonLink href="/guest" variant="ghost" iconEnd="arrowRight">
                Continue as guest
              </ButtonLink>
            </div>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-grey">
            By signing in you agree to our{" "}
            <Link href="/legal/terms" className="font-semibold text-deep underline underline-offset-2">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="font-semibold text-deep underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>

        {/* Brand column */}
        <aside className="grain relative hidden overflow-hidden rounded-[28px] bg-deep p-10 text-cream lg:block">
          <div className="grain-layer" />
          <div className="relative">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
              BANG GA BANG GA
            </p>
            <p className="mt-4 font-display text-[36px] font-extrabold leading-[1.05] text-white">
              NICE TO MEET YOU.
              <br />
              AGAIN.
            </p>
            <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-cream/80">
              Your saved addresses, your last order and every photo strip you have collected are
              waiting where you left them.
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-[15px] text-cream/85">
              <li className="flex items-center gap-2.5">
                <Icon name="check" size={16} /> Reorder your last meal in two taps
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="check" size={16} /> Track a live order without a code
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="check" size={16} /> Keep your student offer handy
              </li>
            </ul>
            <div className="mt-10 flex gap-3" aria-hidden>
              <PhotoStrip frames={3} tilt={-8} className="w-20" />
              <PhotoStrip frames={3} tilt={7} className="w-20" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
