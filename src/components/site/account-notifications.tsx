"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Badge, Callout, Panel } from "@/components/ui/primitives";
import { Toggle } from "@/components/ui/forms";
import { AccountHeader, AccountSignedOut, AccountSkeleton } from "./account-shell";

const HISTORY = [
  { id: "n1", title: "Rider is on the way", body: "Ahmad picked up order BG-260920-0133.", at: "Yesterday, 19:48", unread: false },
  { id: "n2", title: "Student Wednesday is on", body: "10% off signature chicken today with a student ID.", at: "Wednesday", unread: true },
  { id: "n3", title: "Photo booth from RM1", body: "Add a session when you order a set.", at: "18 Sep", unread: false },
];

export function AccountNotifications() {
  const { hydrated, sim, pushToast } = useStore();
  const [prefs, setPrefs] = useState({
    orders: true,
    promotions: true,
    booth: false,
    email: true,
    push: true,
    sms: false,
  });

  if (!hydrated) return <AccountSkeleton />;
  if (!sim.signedIn) {
    return (
      <div className="container-page py-10">
        <AccountHeader title="Notifications" lead="Choose what reaches you." />
        <AccountSignedOut body="Sign in to manage notification channels." />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10 lg:py-12">
      <AccountHeader
        title="Notifications"
        lead="Order updates stay on so you never miss a rider. Promotions and photo booth news are optional."
      />

      <Panel className="mt-8 p-5">
        <h2 className="text-[18px]">What we send</h2>
        <Toggle
          checked={prefs.orders}
          onChange={() => pushToast({ tone: "warning", title: "Order updates stay on", body: "We need these to tell you when food is ready or arriving." })}
          label="Order updates"
          description="Locked on. Payment, kitchen, rider and refund messages."
        />
        <Toggle
          checked={prefs.promotions}
          onChange={(v) => setPrefs({ ...prefs, promotions: v })}
          label="Promotions"
          description="Student Wednesday, lunch rush and weekend free delivery."
        />
        <Toggle
          checked={prefs.booth}
          onChange={(v) => setPrefs({ ...prefs, booth: v })}
          label="Photo booth"
          description="When a booth is down, and new frame designs."
        />
      </Panel>

      <Panel className="mt-4 p-5">
        <h2 className="text-[18px]">Channels</h2>
        <Toggle checked={prefs.push} onChange={(v) => setPrefs({ ...prefs, push: v })} label="Push notifications" />
        <Toggle checked={prefs.email} onChange={(v) => setPrefs({ ...prefs, email: v })} label="Email" />
        <Toggle checked={prefs.sms} onChange={(v) => setPrefs({ ...prefs, sms: v })} label="SMS" description="Used only for rider and pickup alerts." />
      </Panel>

      <h2 className="mt-8 text-[18px]">Recent</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {HISTORY.map((n) => (
          <li key={n.id}>
            <Panel className="flex items-start gap-3 p-4">
              {n.unread && <Badge tone="warning" soft>Unread</Badge>}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{n.title}</p>
                <p className="text-[14px] text-ink/75">{n.body}</p>
                <p className="mt-1 text-[12px] text-grey">{n.at}</p>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
      <Callout tone="neutral" className="mt-6">
        Push permission is requested in the mobile app after a one-screen explanation. Denial still
        leaves in-app status and email working.
      </Callout>
    </div>
  );
}
