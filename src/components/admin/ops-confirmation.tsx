"use client";

import { useState } from "react";
import { AdminCard, AdminShell } from "@/components/admin/shell";
import {
  CountdownPill,
  FulfilmentTag,
  PrototypeNote,
  itemSummary,
  slaWindowSeconds,
  useOpsClock,
} from "@/components/admin/ops-shared";
import { branchById, PROTOTYPE_RULES } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, Button, Callout, EmptyState } from "@/components/ui/primitives";
import { Drawer } from "@/components/ui/overlays";
import { OrderLinesList } from "@/components/ui/data";
import { SelectField } from "@/components/ui/forms";
import { REJECTION_REASONS } from "@/lib/status";
import type { Order } from "@/lib/types";

export function ConfirmationQueue() {
  const { orders, sim, setStatus, patchOrder, pushToast } = useStore();
  const now = useOpsClock(1000);
  const clock = now ?? Date.parse("2026-09-21T19:08:00+08:00");
  const windowSec = slaWindowSeconds(sim.fastForward);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>(REJECTION_REASONS[0]);

  const queue = orders.filter((o) => o.status === "WAITING_FOR_BRANCH");
  const open = orders.find((o) => o.id === openId);

  const left = (o: Order) => {
    const elapsed = Math.floor((clock - Date.parse(o.placedAt)) / 1000);
    return Math.max(0, windowSec - elapsed);
  };

  return (
    <AdminShell
      title="Branch confirmation"
      description="Accept or reject incoming paid orders inside the five-minute window. Bulk accept is not offered — capacity is a judgement."
      actions={
        <Badge tone={queue.length ? "warning" : "success"} icon={queue.length ? "hourglass" : "check"}>
          {queue.length} waiting
        </Badge>
      }
    >
      <PrototypeNote>
        {PROTOTYPE_RULES.branchSlaLabel} Fast-forward is {sim.fastForward ? "on" : "off"}.
      </PrototypeNote>

      {queue.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="check" title="Nothing waiting" body="Quiet so far — new paid orders will land here with a countdown." compact />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {queue.map((o) => {
            const sec = left(o);
            return (
              <li key={o.id}>
                <AdminCard>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="num font-semibold text-ink">{o.code}</p>
                      <p className="text-[13px] text-grey">
                        {o.customerName} · {branchById(o.branchId).shortName} · {itemSummary(o)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <FulfilmentTag type={o.fulfilment} />
                        <span className="num text-[13px] font-bold">{money(o.total)}</span>
                      </div>
                    </div>
                    <CountdownPill secondsLeft={sec} totalSeconds={windowSec} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        setStatus(o.id, "ACCEPTED", `Accepted by ${branchById(o.branchId).shortName}`, "branch");
                        setStatus(o.id, "PREPARING", "Kitchen started", "kitchen");
                        pushToast({ tone: "success", title: `${o.code} accepted` });
                      }}
                    >
                      Accept order
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setOpenId(o.id)}>
                      Reject…
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setOpenId(o.id)}>
                      Details
                    </Button>
                  </div>
                </AdminCard>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.code ?? "Order"}
        subtitle={open ? `${open.customerName} · ${money(open.total)}` : undefined}
        footer={
          open ? (
            <>
              <Button
                onClick={() => {
                  setStatus(open.id, "ACCEPTED", "Accepted", "branch");
                  setOpenId(null);
                }}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  patchOrder(open.id, { rejectionReason: reason });
                  setStatus(open.id, "REJECTED", `Rejected — ${reason}`, "branch");
                  setStatus(open.id, "REFUND_PENDING", "Refund initiated");
                  setOpenId(null);
                  pushToast({ tone: "warning", title: `${open.code} rejected`, body: "Refund started." });
                }}
              >
                Reject and refund
              </Button>
            </>
          ) : null
        }
      >
        {open && (
          <div className="flex flex-col gap-4">
            <OrderLinesList order={open} compact />
            <SelectField
              label="Rejection reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={REJECTION_REASONS.map((r) => ({ value: r, label: r }))}
            />
            <Callout tone="warning">{PROTOTYPE_RULES.refundTimingLabel}</Callout>
          </div>
        )}
      </Drawer>
    </AdminShell>
  );
}
