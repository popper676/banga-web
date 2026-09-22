"use client";

/**
 * Branch context for the bag. Every price, fee and availability statement on
 * the cart belongs to one branch, so the branch, its open state and the
 * fulfilment mode are stated at the top rather than implied.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { branchById } from "@/lib/mock-data";
import { branchStatus, etaRange, todayHours } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, BranchOpenBadge, Button, Callout } from "@/components/ui/primitives";
import { SelectField } from "@/components/ui/forms";
import { Icon } from "@/components/ui/icons";
import { BranchChip } from "@/components/site/branch-switcher";

export type BranchOpenState = ReturnType<typeof branchStatus> | null;

/**
 * Opening hours depend on the clock, which only exists on the client. The
 * status stays null through the server render and the first paint so the
 * markup is deterministic, then refreshes every minute.
 */
export function useBranchOpenState(branchId: string): BranchOpenState {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  return now ? branchStatus(branchById(branchId), now) : null;
}

export function CartBranchStrip({ status }: { status: BranchOpenState }) {
  const { branchId, draft } = useStore();
  const branch = branchById(branchId);
  const isDelivery = draft.fulfilment === "delivery";

  return (
    <section
      aria-labelledby="cart-branch-label"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[16px] border border-line bg-white p-4"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint text-deep"
        aria-hidden
      >
        <Icon name="pin" size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          id="cart-branch-label"
          className="text-[12px] font-semibold uppercase tracking-[0.14em] text-grey"
        >
          This bag is for
        </p>
        <p className="text-[16px] font-semibold leading-snug text-ink">{branch.name}</p>
        <p className="num mt-0.5 text-[13px] leading-snug text-grey">
          {branch.address}, {branch.postcode} {branch.city} · Today {todayHours(branch)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info" soft icon={isDelivery ? "bike" : "bag"}>
          {isDelivery ? "Delivery" : "Pickup"} · {etaRange(branch, draft.fulfilment)}
        </Badge>
        {status ? (
          <BranchOpenBadge
            open={status.open}
            detail={status.open ? `until ${status.nextChange}` : `opens ${status.nextChange}`}
          />
        ) : (
          <Badge tone="neutral" soft icon="clock">
            Checking today&rsquo;s hours
          </Badge>
        )}
        <BranchChip />
        <Link
          href="/locations"
          className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[13px] font-semibold text-deep underline underline-offset-4"
        >
          Compare branches
          <Icon name="chevronRight" size={14} />
        </Link>
      </div>
    </section>
  );
}

/** Slots on the half hour from the moment the branch reopens. */
function reopeningSlots(nextChange: string): string[] {
  const [hours, minutes] = nextChange.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return [];
  return [0, 30, 60, 90].map((add) => {
    const total = hours * 60 + minutes + add;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  });
}

/** Shown only once the clock has been read, and only while the branch is shut. */
export function CartClosedNotice({ status }: { status: BranchOpenState }) {
  const { branchId } = useStore();
  const branch = branchById(branchId);
  const [slot, setSlot] = useState("");
  const [held, setHeld] = useState<string | null>(null);

  if (!status || status.open) return null;

  const slots = reopeningSlots(status.nextChange);

  return (
    <Callout tone="warning" icon="clock" title={`${branch.shortName} is closed right now`}>
      <p>
        Today&rsquo;s hours are <span className="num font-semibold">{todayHours(branch)}</span>, so
        the kitchen reopens at <span className="num font-semibold">{status.nextChange}</span>.
        Nothing in your bag is lost — hold it for a time after opening, or move the order to our
        other branch.
      </p>

      {slots.length > 0 && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <SelectField
            label="Hold this bag for"
            value={slot}
            onChange={(e) => {
              setSlot(e.target.value);
              setHeld(null);
            }}
            options={[
              { value: "", label: "Choose a time" },
              ...slots.map((s) => ({ value: s, label: `Today, ${s}` })),
            ]}
            className="min-w-48"
          />
          <Button
            variant="secondary"
            disabled={!slot}
            onClick={() => setHeld(slot)}
            iconStart="clock"
          >
            Hold for later
          </Button>
          <BranchChip />
        </div>
      )}

      <p aria-live="polite" className="mt-2 text-[13px] font-medium text-ink">
        {held
          ? `Saved on this device — we will have this bag ready to send at ${held}. Checkout unlocks when ${branch.shortName} opens.`
          : ""}
      </p>
    </Callout>
  );
}
