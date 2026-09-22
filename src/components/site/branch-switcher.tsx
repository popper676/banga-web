"use client";

import { useState } from "react";
import { BRANCHES, PRODUCTS, branchById } from "@/lib/mock-data";
import { branchStatus, cn, etaRange, todayHours } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, Button, Callout } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/overlays";
import { Icon } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/forms";

export function BranchChip({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { branchId } = useStore();
  const branch = branchById(branchId);
  const status = branchStatus(branch);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink transition-colors hover:border-ink",
          className,
        )}
      >
        <Icon name="pin" size={15} />
        <span className="max-w-32 truncate">{branch.shortName}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
            status.open ? "bg-mint text-deep" : "bg-ink/8 text-grey",
          )}
        >
          {status.open ? "Open" : "Closed"}
        </span>
        <Icon name="chevronDown" size={14} />
      </button>
      <BranchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function BranchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { branchId, setBranchId, lines, markUnavailable, pushToast, draft, patchDraft } = useStore();
  const [pending, setPending] = useState<string | null>(null);

  const targetId = pending ?? branchId;
  const target = branchById(targetId);

  const affected = lines.filter((l) => {
    const p = l.productId;
    // A line is affected when the product is sold out at the target branch.
    return SOLD_OUT_AT(targetId).includes(p);
  });

  const confirmSwitch = (id: string) => {
    const soldOut = lines.filter((l) => SOLD_OUT_AT(id).includes(l.productId));
    setBranchId(id);
    if (soldOut.length > 0) {
      markUnavailable(
        soldOut.map((l) => l.lineId),
        id,
      );
      pushToast({
        tone: "warning",
        title: `Switched to ${branchById(id).shortName}`,
        body: `${soldOut.length} item${soldOut.length > 1 ? "s are" : " is"} unavailable here and needs attention in your cart.`,
      });
    } else {
      markUnavailable([], id);
      pushToast({ tone: "success", title: `Now ordering from ${branchById(id).shortName}` });
    }
    setPending(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setPending(null);
        onClose();
      }}
      title="Choose a branch"
      description="We recommend the nearest branch that can fulfil your order. You can change it at any time."
      size="md"
    >
      <div className="mb-4">
        <Segmented
          label="Fulfilment type"
          value={draft.fulfilment}
          onChange={(v) => patchDraft({ fulfilment: v })}
          options={[
            { value: "pickup", label: "Pickup", icon: "bag" },
            { value: "delivery", label: "Delivery", icon: "bike" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-3">
        {[...BRANCHES]
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .map((b, i) => {
            const status = branchStatus(b);
            const selected = b.id === branchId;
            const supports = draft.fulfilment === "delivery" ? b.supportsDelivery : b.supportsPickup;
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-[14px] border p-4",
                  selected ? "border-ink bg-mint" : "border-line bg-white",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px]">{b.name}</h3>
                      {i === 0 && <Badge tone="info" icon="location" soft>Nearest to you</Badge>}
                    </div>
                    <p className="mt-1 text-[13px] text-grey">
                      {b.address}, {b.postcode} {b.city}
                    </p>
                  </div>
                  <Badge tone={status.open ? "success" : "neutral"} icon={status.open ? "check" : "clock"} soft={!status.open}>
                    {status.open ? status.detail : status.detail}
                  </Badge>
                </div>

                <dl className="num mt-3 grid grid-cols-3 gap-2 text-[12px]">
                  <div>
                    <dt className="text-grey">Distance</dt>
                    <dd className="font-semibold text-ink">{b.distanceKm} km</dd>
                  </div>
                  <div>
                    <dt className="text-grey">Today</dt>
                    <dd className="font-semibold text-ink">{todayHours(b)}</dd>
                  </div>
                  <div>
                    <dt className="text-grey">{draft.fulfilment === "pickup" ? "Ready in" : "Delivery"}</dt>
                    <dd className="font-semibold text-ink">{etaRange(b, draft.fulfilment)}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {b.supportsDineIn && <Badge soft tone="neutral" icon="home">Dine-in</Badge>}
                  {b.supportsPickup && <Badge soft tone="neutral" icon="bag">Pickup</Badge>}
                  {b.supportsDelivery && <Badge soft tone="neutral" icon="bike">Delivery</Badge>}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {selected ? (
                    <Badge tone="success" icon="check">Currently selected</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant={supports ? "dark" : "secondary"}
                      disabled={!supports}
                      onClick={() => (lines.length > 0 ? setPending(b.id) : confirmSwitch(b.id))}
                    >
                      Order from {b.shortName}
                    </Button>
                  )}
                  {!supports && (
                    <span className="text-[12px] font-medium text-cta">
                      {draft.fulfilment === "delivery" ? "Delivery" : "Pickup"} not available here
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {pending && (
        <div className="mt-4">
          <Callout tone="warning" title={`Switch to ${target.shortName}?`}>
            <p>
              Your cart has {lines.length} item{lines.length > 1 ? "s" : ""}. Prices and availability
              are set per branch.
            </p>
            {affected.length > 0 ? (
              <ul className="mt-2 list-disc pl-4">
                {affected.map((l) => (
                  <li key={l.lineId}>
                    <strong>{l.name}</strong> is sold out at {target.shortName} and will be flagged in
                    your cart.
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Everything in your cart is available at {target.shortName}.</p>
            )}
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => confirmSwitch(pending)}>
                Switch branch
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                Keep {branchById(branchId).shortName}
              </Button>
            </div>
          </Callout>
        </div>
      )}
    </Dialog>
  );
}

/** Products that are sold out at a given branch, from the mock catalogue. */
function SOLD_OUT_AT(branchId: string): string[] {
  return PRODUCTS.filter((p) => p.availability[branchId] === "sold_out").map((p) => p.id);
}
