import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { PhotoStrip } from "@/components/ui/media";
import { RegisterForm } from "@/components/site/auth-register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a BANG GA BANG GA account to reorder in two taps, keep your Klang Valley delivery addresses and collect photo booth stamps. UI prototype — no real sign-up.",
};

const PERKS = [
  {
    icon: "receipt" as const,
    title: "Every receipt in one place",
    body: "Order history with itemised receipts you can reprint, and refund references you can quote.",
  },
  {
    icon: "pin" as const,
    title: "Addresses that remember themselves",
    body: "Home, office or campus — with the gate code and the landmark the rider actually needs.",
  },
  {
    icon: "camera" as const,
    title: "Photo booth stamps",
    body: "Ten visits, one free session. The strips are yours; the stamps live in your account.",
  },
];

export default function RegisterPage() {
  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Form column */}
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-[clamp(30px,5vw,48px)] leading-[1.02]">CREATE AN ACCOUNT</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80">
            It takes about a minute. We ask for a mobile number because the branch and the rider call
            it — not so we can sell it to anyone.
          </p>

          <RegisterForm />

          <p className="mt-5 text-[13px] leading-relaxed text-grey">
            We process your details under the Personal Data Protection Act 2010. Read the{" "}
            <Link
              href="/legal/privacy"
              className="font-semibold text-deep underline underline-offset-2"
            >
              privacy policy
            </Link>{" "}
            or the{" "}
            <Link href="/legal/terms" className="font-semibold text-deep underline underline-offset-2">
              terms of service
            </Link>
            .
          </p>
        </div>

        {/* Brand column */}
        <aside className="grain relative hidden overflow-hidden rounded-[28px] bg-deep p-10 text-cream lg:block lg:sticky lg:top-24">
          <div className="grain-layer" />
          <div className="relative">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
              BANG GA BANG GA
            </p>
            <p className="mt-4 font-display text-[36px] font-extrabold leading-[1.05] text-white">
              NICE TO MEET YOU.
              <br />
              NOW, LET&rsquo;S EAT.
            </p>
            <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-cream/80">
              An account is not required to order. It just means you stop typing your address into a
              phone with one hand while holding a tray with the other.
            </p>

            <ul className="mt-8 flex flex-col gap-5">
              {PERKS.map((perk) => (
                <li key={perk.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-teal">
                    <Icon name={perk.icon} size={18} />
                  </span>
                  <div>
                    <p className="font-display text-[16px] font-bold text-white">{perk.title}</p>
                    <p className="mt-1 max-w-[32ch] text-[14px] leading-relaxed text-cream/75">
                      {perk.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-end gap-3" aria-hidden>
              <PhotoStrip frames={3} tilt={-7} className="w-20" />
              <PhotoStrip frames={4} tilt={6} className="w-20" />
            </div>
            <p className="mt-6 font-display text-[13px] font-bold uppercase tracking-[0.2em] text-teal">
              Make it last.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
