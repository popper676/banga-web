"use client";

import { useState } from "react";
import { AdminCard, AdminShell, AlertRow } from "@/components/admin/shell";
import { FulfilmentTag, PrototypeNote } from "@/components/admin/ops-shared";
import { branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Button, Callout, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { MapView } from "@/components/ui/media";
import type { Order } from "@/lib/types";

export function DeliveryBoard() {
  const { orders, setStatus, patchOrder, sim, pushToast } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const list = orders.filter((o) => o.fulfilment === "delivery" && !["CANCELLED", "PENDING_PAYMENT"].includes(o.status));
  const failed = list.filter((o) => o.status === "FAILED");
  const open = list.find((o) => o.id === selected) ?? list.find((o) => o.status === "OUT_FOR_DELIVERY") ?? list[0];

  const book = (o: Order) => {
    if (sim.riderOutcome === "no_rider") {
      setStatus(o.id, "LALAMOVE_BOOKED", "Lalamove booked", "branch");
      setStatus(o.id, "FAILED", "No rider found", "system");
      patchOrder(o.id, {
        delivery: { provider: "Lalamove", fee: o.deliveryFee, status: "failed", failureReason: "No rider accepted within 12 minutes" },
      });
      pushToast({ tone: "danger", title: "No rider found", body: "Rebook, convert to pickup, or refund." });
      return;
    }
    setStatus(o.id, "LALAMOVE_BOOKED", "Lalamove booked", "branch");
    patchOrder(o.id, {
      delivery: {
        provider: "Lalamove",
        quotationId: "LLM-Q-7741",
        bookingId: "LLM-B-55120",
        fee: o.deliveryFee,
        status: "assigned",
        riderName: "Ahmad Faizal",
        riderPhone: "+60 13-662 8890",
        riderVehicle: "Yamaha NMAX",
        riderPlate: "WXY 1234",
        etaMinutes: 12,
      },
    });
    pushToast({ tone: "success", title: "Delivery booked", body: "Ahmad assigned · WXY 1234" });
  };

  return (
    <AdminShell
      title="Delivery tracking"
      description="Lalamove quotations, bookings and live rider status. Quotes are mock; the fee shown is the one charged at checkout."
    >
      <PrototypeNote>Use the prototype panel’s “Lalamove rider” switch to demo a failed booking.</PrototypeNote>

      {failed.length > 0 && (
        <ul className="mt-4 rounded-[14px] border border-cta/30 bg-white px-4">
          {failed.map((o) => (
            <AlertRow
              key={o.id}
              tone="danger"
              title={`${o.code} — no rider`}
              detail="Rebook, convert to pickup, or start a refund."
              href={`/admin/orders/${o.id}`}
              actionLabel="Open order"
            />
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        {list.length === 0 ? (
          <EmptyState icon="bike" title="No delivery orders" compact />
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelected(o.id)}
                  className="w-full rounded-[12px] border border-line bg-white p-3 text-left hover:bg-mint/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="num font-semibold">{o.code}</span>
                    <StatusBadge status={o.status} audience="admin" />
                  </div>
                  <p className="mt-1 text-[13px] text-grey">
                    {branchById(o.branchId).shortName} · {money(o.deliveryFee)} fee
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && (
          <AdminCard>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="num font-bold">{open.code}</p>
                <p className="text-[13px] text-grey">{open.address?.line1}</p>
              </div>
              <FulfilmentTag type="delivery" branchName={branchById(open.branchId).shortName} />
            </div>
            <MapView
              className="mt-4 h-48"
              label="Delivery map"
              route
              pins={[
                { x: 30, y: 70, tone: "branch", name: branchById(open.branchId).shortName },
                { x: 55, y: 45, tone: "rider", name: open.delivery?.riderName ?? "Rider" },
                { x: 78, y: 22, tone: "customer", name: "Drop-off" },
              ]}
            />
            <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <dt className="text-grey">Quote</dt>
                <dd className="num font-semibold">{open.delivery?.quotationId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-grey">Booking</dt>
                <dd className="num font-semibold">{open.delivery?.bookingId ?? "Not booked"}</dd>
              </div>
              <div>
                <dt className="text-grey">Rider</dt>
                <dd className="font-semibold">{open.delivery?.riderName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-grey">Plate</dt>
                <dd className="num font-semibold">{open.delivery?.riderPlate ?? "—"}</dd>
              </div>
            </dl>
            {open.status === "READY" && (
              <Button className="mt-4" onClick={() => book(open)}>
                Get quotation and book
              </Button>
            )}
            {open.delivery?.status === "failed" && (
              <Callout tone="danger" className="mt-4" title="Booking failed">
                {open.delivery.failureReason}
              </Callout>
            )}
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
