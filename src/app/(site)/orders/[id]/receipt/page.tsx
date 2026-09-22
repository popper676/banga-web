import type { Metadata } from "next";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { ReceiptScreen } from "@/components/site/receipt-screen";

export const metadata: Metadata = {
  title: "Receipt",
  description: "Itemised receipt for your BANG GA BANG GA order.",
};

export function generateStaticParams() {
  return MOCK_ORDERS.map((o) => ({ id: o.id }));
}

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReceiptScreen orderId={id} />;
}
