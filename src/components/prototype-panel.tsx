"use client";

/**
 * Floating prototype control panel.
 *
 * This is the switchboard for every simulated state in the build — payment
 * outcomes, branch responses, rider availability, refund mode, connectivity
 * and reduced motion. It exists only in the prototype and would never ship.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Icon } from "./ui/icons";
import { Toggle } from "./ui/forms";

const LINKS = [
  { href: "/", label: "Customer website" },
  { href: "/prototype", label: "Screen index" },
  { href: "/design-system", label: "Design system" },
  { href: "/mobile", label: "Mobile frames" },
  { href: "/admin", label: "Admin console" },
  { href: "/menu", label: "Start ordering" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-ink/70">{label}</span>
      {children}
    </div>
  );
}

function Seg<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full bg-ink/6 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
            value === o.value ? "bg-ink text-white" : "text-ink/70 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PrototypePanel() {
  const [open, setOpen] = useState(false);
  const { sim, patchSim, clearCart, resetDraft } = useStore();
  const pathname = usePathname();

  return (
    <div className="no-print fixed bottom-4 right-4 z-[70] print:hidden">
      {open && (
        <div className="mb-2 max-h-[78dvh] w-80 overflow-auto rounded-[18px] border border-ink/15 bg-white p-4 shadow-none ring-1 ring-ink/5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-display text-[15px] font-bold text-ink">Prototype controls</p>
              <p className="text-[11px] text-grey">UI simulation only — no backend</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close prototype controls"
              className="flex size-8 items-center justify-center rounded-full text-grey hover:bg-mint hover:text-ink"
            >
              <Icon name="cross" size={16} />
            </button>
          </div>

          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-deep">Jump to</p>
          <div className="mb-4 grid grid-cols-2 gap-1.5">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-[8px] border px-2 py-1.5 text-[11px] font-semibold",
                  pathname === l.href
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink hover:bg-mint",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-deep">
            Simulated outcomes
          </p>
          <Row label="Visa card result">
            <Seg
              label="Visa card result"
              value={sim.cardOutcome}
              onChange={(v) => patchSim({ cardOutcome: v })}
              options={[
                { value: "success", label: "OK" },
                { value: "declined", label: "Declined" },
                { value: "delayed", label: "Delayed" },
                { value: "duplicate", label: "Dupe" },
              ]}
            />
          </Row>
          <Row label="DuitNow QR result">
            <Seg
              label="DuitNow QR result"
              value={sim.qrOutcome}
              onChange={(v) => patchSim({ qrOutcome: v })}
              options={[
                { value: "success", label: "Paid" },
                { value: "expire", label: "Expire" },
                { value: "delayed", label: "Delayed" },
              ]}
            />
          </Row>
          <Row label="Branch response">
            <Seg
              label="Branch response"
              value={sim.branchResponse}
              onChange={(v) => patchSim({ branchResponse: v })}
              options={[
                { value: "accept", label: "Accept" },
                { value: "reject", label: "Reject" },
                { value: "timeout", label: "5-min" },
              ]}
            />
          </Row>
          <Row label="Lalamove rider">
            <Seg
              label="Lalamove rider"
              value={sim.riderOutcome}
              onChange={(v) => patchSim({ riderOutcome: v })}
              options={[
                { value: "normal", label: "Found" },
                { value: "no_rider", label: "None" },
              ]}
            />
          </Row>
          <Row label="Refund capability">
            <Seg
              label="Refund capability"
              value={sim.refundMode}
              onChange={(v) => patchSim({ refundMode: v })}
              options={[
                { value: "auto", label: "Automatic" },
                { value: "manual", label: "Manual" },
              ]}
            />
          </Row>

          <div className="mt-3 border-t border-line pt-2">
            <Toggle
              checked={sim.fastForward}
              onChange={(v) => patchSim({ fastForward: v })}
              label="Fast-forward timers"
              description="Compress the 5-minute branch SLA and QR expiry so the flow is reviewable"
            />
            <Toggle
              checked={sim.signedIn}
              onChange={(v) => patchSim({ signedIn: v })}
              label="Signed in"
              description="Off = guest checkout path"
            />
            <Toggle
              checked={sim.offline}
              onChange={(v) => patchSim({ offline: v })}
              label="Simulate offline"
              description="Shows the offline banner and disables network-dependent actions"
            />
            <Toggle
              checked={sim.reducedMotion}
              onChange={(v) => patchSim({ reducedMotion: v })}
              label="Reduced motion"
              description="Replaces movement with opacity changes across the whole prototype"
            />
          </div>

          <button
            onClick={() => {
              clearCart();
              resetDraft();
            }}
            className="mt-3 w-full rounded-full border border-line py-2 text-[12px] font-semibold text-ink hover:bg-mint"
          >
            Reset cart and checkout
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-white ring-2 ring-white"
      >
        <Icon name="settings" size={16} />
        Prototype
      </button>
    </div>
  );
}
