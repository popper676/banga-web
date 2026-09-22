"use client";

import { MOCK_USER, branchById } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Button, ButtonLink, ErrorState, Panel, Skeleton } from "@/components/ui/primitives";
import { OrderLinesList, TotalsBlock } from "@/components/ui/data";
import { Logo } from "@/components/site/header";
import { formatDateTime } from "./account-shell";
import { PROVIDER_COPY } from "@/components/admin/config-shared";

export function ReceiptScreen({ orderId }: { orderId: string }) {
  const { hydrated, orders } = useStore();
  const order = orders.find((o) => o.id === orderId);

  if (!hydrated) {
    return (
      <div className="container-page py-16">
        <Skeleton className="mx-auto h-[640px] max-w-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Receipt not found" body="Check the order code on your email." requestId="RCP-NF-02" />
      </div>
    );
  }

  const branch = branchById(order.branchId);
  const provider = PROVIDER_COPY[order.payment.method];
  const paidAt = order.payment.paidAt ? formatDateTime(order.payment.paidAt) : "—";

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">Receipt</h1>
        <div className="flex gap-2">
          <Button variant="secondary" iconStart="printer" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="ghost" iconStart="download" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </div>

      <Panel className="mx-auto max-w-xl p-7 print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-4">
          <Logo size="sm" />
          <p className="num text-right text-[13px] text-grey">
            SST no. W10-1234-56789012
            <br />
            Company no. 202301234567
          </p>
        </div>

        <h2 className="mt-6 font-display text-[22px]">Official receipt</h2>
        <p className="num mt-1 text-[14px] text-grey">{order.code}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <dt className="text-grey">Branch</dt>
          <dd className="text-right font-medium">
            {branch.name}
            <br />
            {branch.address}
          </dd>
          <dt className="text-grey">Placed</dt>
          <dd className="num text-right">{formatDateTime(order.placedAt)}</dd>
          <dt className="text-grey">Fulfilment</dt>
          <dd className="text-right capitalize">{order.fulfilment}</dd>
          <dt className="text-grey">Customer</dt>
          <dd className="text-right">{order.customerName}</dd>
        </dl>

        <div className="mt-6 border-t border-line pt-4">
          <OrderLinesList order={order} compact />
        </div>
        <div className="mt-4 border-t border-line pt-3">
          <TotalsBlock
            subtotal={order.subtotal}
            discount={order.discount}
            deliveryFee={order.deliveryFee}
            tax={order.tax}
            total={order.total}
            promotionLabel={order.promotionCode}
            fulfilment={order.fulfilment}
          />
        </div>

        <div className="mt-6 rounded-[12px] bg-mint p-4 text-[13px]">
          <p className="font-semibold text-ink">
            {provider.method} · {money(order.payment.amount)}
          </p>
          <p className="mt-1 text-grey">{provider.providerLine}</p>
          <p className="num mt-1 text-ink">
            Reference {order.payment.reference}
            {order.payment.maskedCard ? ` · ${order.payment.maskedCard}` : ""}
          </p>
          <p className="mt-1 text-grey">Paid {paidAt}</p>
        </div>

        {order.payment.refundReference && (
          <div className="mt-4 rounded-[12px] border border-yellow bg-yellow/25 p-4 text-[13px]">
            <p className="font-semibold">Refund {order.payment.status.replaceAll("_", " ")}</p>
            <p className="num mt-1">Ref {order.payment.refundReference}</p>
            {order.payment.refundNote && <p className="mt-1">{order.payment.refundNote}</p>}
          </div>
        )}

        <p className="mt-6 text-[12px] leading-relaxed text-grey">
          Prices include 6% SST. BANG GA BANG GA is a Muslim-friendly kitchen. This receipt is a
          record of the simulated payment in this prototype — no money moved.
        </p>
        <p className="mt-3 text-[12px] text-grey">Thank you, {order.customerName || MOCK_USER.name}.</p>
      </Panel>

      <div className="no-print mt-6 flex justify-center">
        <ButtonLink href={`/orders/${order.id}`} variant="ghost">
          Back to tracking
        </ButtonLink>
      </div>
    </div>
  );
}
