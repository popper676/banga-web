"use client";

/**
 * Shared chrome for the account section: the sub-navigation, the signed-out
 * state and the loading skeleton.
 *
 * "Signed in" is the `sim.signedIn` flag from the prototype store — there is no
 * auth service anywhere in this build.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { Icon, type IconKey } from "@/components/ui/icons";
import { ButtonLink, Panel, Skeleton } from "@/components/ui/primitives";

const ACCOUNT_NAV: { href: string; label: string; icon: IconKey }[] = [
  { href: "/account", label: "Overview", icon: "user" },
  { href: "/account/orders", label: "Orders", icon: "receipt" },
  { href: "/account/addresses", label: "Addresses", icon: "pin" },
  { href: "/account/notifications", label: "Notifications", icon: "bell" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account sections" className="overflow-x-auto">
      <ul className="flex gap-1.5">
        {ACCOUNT_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink hover:border-ink/45",
                )}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Page title block used by every account screen, with the sub-navigation. */
export function AccountHeader({
  title,
  lead,
  trailing,
}: {
  title: string;
  lead: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="border-b border-line pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[56ch]">
          <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.04]">{title}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80">{lead}</p>
        </div>
        {trailing}
      </div>
      <div className="mt-6">
        <AccountNav />
      </div>
    </div>
  );
}

export function AccountSignedOut({
  title = "You are signed out",
  body,
}: {
  title?: string;
  body: string;
}) {
  return (
    <Panel className="mx-auto mt-8 max-w-xl p-7 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint text-deep">
        <Icon name="lock" size={24} />
      </span>
      <h2 className="mt-4 text-[22px]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-relaxed text-ink/80">{body}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/login" size="lg">
          Sign in
        </ButtonLink>
        <ButtonLink href="/register" variant="secondary" size="lg">
          Create an account
        </ButtonLink>
      </div>

      <div className="mt-6 border-t border-line pt-5 text-[14px] leading-relaxed text-grey">
        <p>
          Ordering without an account is fine too —{" "}
          <Link href="/guest" className="font-semibold text-deep underline underline-offset-2">
            continue as a guest
          </Link>{" "}
          or{" "}
          <Link href="/track" className="font-semibold text-deep underline underline-offset-2">
            track an order with its code
          </Link>
          .
        </p>
        <p className="mt-3 flex items-start justify-center gap-2 text-[13px]">
          <span className="mt-0.5 shrink-0 text-deep">
            <Icon name="settings" size={14} />
          </span>
          Prototype: flip the <strong className="font-semibold text-ink">Signed in</strong> switch in
          the prototype panel, bottom right, to see the signed-in version of this screen.
        </p>
      </div>
    </Panel>
  );
}

/** Matches the real layout rather than a blocking spinner. */
export function AccountSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <Skeleton className="h-11 w-64 rounded-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-[16px]" />
      ))}
      <span className="sr-only" role="status">
        Loading your account
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dates — fixed to Asia/Kuala_Lumpur so server and client agree       */
/* ------------------------------------------------------------------ */

const DATE_FMT = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kuala_Lumpur",
});

const TIME_FMT = new Intl.DateTimeFormat("en-MY", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kuala_Lumpur",
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${DATE_FMT.format(d)} · ${TIME_FMT.format(d)}`;
}
