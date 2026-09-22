import type { Metadata } from "next";
import { OrderDetail } from "@/components/admin/order-detail";
import { MOCK_ORDERS } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = MOCK_ORDERS.find((o) => o.id === id);
  return {
    title: order ? `Order ${order.code}` : "Order",
    description: order
      ? `Order ${order.code} for ${order.customerName} — items, payment, timeline and the actions available from its current status.`
      : "Order detail.",
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}