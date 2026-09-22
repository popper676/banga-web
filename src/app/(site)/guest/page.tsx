import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconKey } from "@/components/ui/icons";
import { GuestForm } from "@/components/site/auth-guest-form";

export const metadata: Metadata = {
  title: "Continue as guest",
  description:
    "Order from BANG GA BANG GA without an account. You keep tracking by code, receipts by email and the same menu — you lose saved addresses and order history.",
};

const KEEP: { icon: IconKey; title: string; body: string }[] = [
  {
    icon: "receipt",
    title: "A tracking code for this order",
    body: "Texted to your phone and emailed to you. Enter it on the Track Order page any time to see exactly where your food is.",
  },
  {
    icon: "card",
    title: "The same two ways to pay",
    body: "Visa card or DuitNow QR, with the same receipt and the same refund rules as an account holder.",
  },
  {
    icon: "bike",
    title: "The same delivery and pickup",
    body: "Same branches, same radius, same rider service. Guest orders are not deprioritised in the kitchen.",
  },
  {
    icon: "shield",
    title: "The same refund protection",
    body: "If a branch rejects your order or does not respond in 5 minutes, your refund starts automatically with a reference.",
  },
];

const LOSE: { icon: IconKey; title: string; body: string }[] = [
  {
    icon: "pin",
    title: "No saved addresses",
    body: "You retype the unit number, the gate code and the landmark every single time you order.",
  },
  {
    icon: "list",
    title: "No order history",
    body: "Reorder in two taps is not available, and past receipts are only in your email — if you still have the tracking code.",
  },
  {
    icon: "camera",
    title: "No photo booth stamps",
    body: "Stamps collect against an account. Ten visits earn a free session, and guest orders do not count.",
  },
  {
    icon: "bell",
    title: "No notification preferences",
    body: "You get order updates for this order only. Nothing to manage, but nothing to tune either.",
  },
];

export default function GuestPage() {
  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream">
            Guest checkout
          </span>
          <h1 className="mt-5 text-[clamp(30px,5vw,52px)] leading-[1.02]">
            ORDER WITHOUT AN ACCOUNT
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/80">
            Perfectly normal, and genuinely no slower for this order. Here is the honest trade so you
            can decide once instead of wondering at every checkout.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          {/* Trade-off columns */}
          <div className="flex flex-col gap-5">
            <section
              aria-labelledby="guest-keep-title"
              className="rounded-[16px] border border-line bg-white p-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-mint text-deep">
                  <Icon name="check" size={17} />
                </span>
                <h2 id="guest-keep-title" className="text-[20px]">
                  What you keep
                </h2>
              </div>
              <ul className="mt-4 flex flex-col gap-4">
                {KEEP.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-deep">
                      <Icon name={item.icon} size={17} />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-grey">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="guest-lose-title"
              className="rounded-[16px] border border-yellow bg-yellow/20 p-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-ink">
                  <Icon name="alert" size={17} />
                </span>
                <h2 id="guest-lose-title" className="text-[20px]">
                  What you give up
                </h2>
              </div>
              <ul className="mt-4 flex flex-col gap-4">
                {LOSE.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-ink/70">
                      <Icon name={item.icon} size={17} />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-ink/75">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[14px] leading-relaxed text-ink/80">
                You can fix all of this later.{" "}
                <Link
                  href="/register"
                  className="font-semibold text-deep underline underline-offset-2"
                >
                  Creating an account
                </Link>{" "}
                after your order keeps the address and the receipt from it.
              </p>
            </section>
          </div>

          {/* Form */}
          <div className="w-full max-w-md lg:sticky lg:top-24">
            <GuestForm />
          </div>
        </div>
      </div>
    </div>
  );
}
