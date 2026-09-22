"use client";

import { branchById } from "@/lib/mock-data";
import { etaRange } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Panel } from "@/components/ui/primitives";
import { OrderLinesList, TotalsBlock } from "@/components/ui/data";
import { Icon } from "@/components/ui/icons";

export function methodLabel(order: Order): string {
  return order.payment.method === "duitnow_qr" ? "DuitNow QR" : "Visa card";
}

/** Read-only order summary shared by the payment and confirmation screens. */
export function PaymentOrderSummary({
  order,
  title = "Order summary",
}: {
  order: Order;
  title?: string;
}) {
  const branch = branchById(order.branchId);
  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <Panel as="section" aria-label={title} className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[18px]">{title}</h2>
        <span className="num text-[13px] text-grey">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
      </div>

      <dl className="mt-3 flex flex-col gap-2 border-y border-line py-3">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[13px] text-grey">Order</dt>
          <dd className="num text-[13px] font-semibold text-ink">{order.code}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[13px] text-grey">
            {order.fulfilment === "delivery" ? "Delivery from" : "Pickup from"}
          </dt>
          <dd className="text-right text-[13px] font-medium text-ink">{branch.name}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-[13px] text-grey">
            {order.fulfilment === "delivery" ? "Delivering to" : "Ready in"}
          </dt>
          <dd className="text-right text-[13px] font-medium text-ink">
            {order.fulfilment === "delivery" && order.address
              ? `${order.address.line1}, ${order.address.postcode} ${order.address.city}`
              : etaRange(branch, order.fulfilment)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
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
          compact
        />
      </div>

      <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[12px] leading-snug text-grey">
        <li className="flex items-start gap-1.5">
          <span className="mt-px shrink-0 text-deep">
            <Icon name="receipt" size={13} />
          </span>
          Prices include SST at 6%.
        </li>
        <li className="flex items-start gap-1.5">
          <span className="mt-px shrink-0 text-deep">
            <Icon name="lock" size={13} />
          </span>
          {order.payment.method === "duitnow_qr"
            ? "DuitNow QR payments are processed by OXPay."
            : "Card payments are processed securely by Maybank."}
        </li>
      </ul>
    </Panel>
  );
}
