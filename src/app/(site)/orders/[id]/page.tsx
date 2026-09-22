import type { Metadata } from "next";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { TrackingScreen } from "@/components/site/tracking-screen";

export const metadata: Metadata = {
  title: "Track order",
  description: "Live status, rider details and receipt for your BANG GA BANG GA order.",
};

export function generateStaticParams() {
  return MOCK_ORDERS.map((o) => ({ id: o.id }));
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackingScreen orderId={id} />;
}
