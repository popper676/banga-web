"use client";

/**
 * The branch context strip that sits at the top of the menu and the cart.
 * Every price and availability statement below it belongs to this branch,
 * so the branch and its open state are always stated, never implied.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, BranchOpenBadge, Callout } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { BranchChip } from "@/components/site/branch-switcher";
import { useBranchStatus } from "./menu-filters";

export function BranchBanner({
  label = "Ordering from",
  note,
  className,
}: {
  label?: string;
  note?: ReactNode;
  className?: string;
}) {
  const { branchId } = useStore();
  const { branch, status } = useBranchStatus(branchId);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[16px] border border-line bg-white p-4",
        className,
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint text-deep"
        aria-hidden
      >
        <Icon name="pin" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-grey">{label}</p>
        <p className="text-[16px] font-semibold leading-snug text-ink">{branch.name}</p>
        {note && <p className="mt-0.5 text-[13px] leading-snug text-grey">{note}</p>}
      </div>
      {status ? (
        <BranchOpenBadge
          open={status.open}
          detail={status.open ? `until ${status.nextChange}` : `opens ${status.nextChange}`}
        />
      ) : (
        <Badge tone="neutral" icon="clock" soft>
          Checking today&rsquo;s hours
        </Badge>
      )}
      <BranchChip />
    </div>
  );
}

/** Shown only once the clock has been read on the client. */
export function BranchClosedCallout() {
  const { branchId } = useStore();
  const { branch, status } = useBranchStatus(branchId);
  if (!status || status.open) return null;

  return (
    <Callout
      tone="warning"
      icon="clock"
      title={`${branch.shortName} is closed right now`}
      action={<BranchChip />}
    >
      You can keep browsing and build your order — {branch.shortName} reopens at{" "}
      <span className="num font-semibold">{status.nextChange}</span>. Our other branch may still be
      taking orders.
    </Callout>
  );
}
