import type { Metadata } from "next";
import { PaymentDetail } from "@/components/admin/money-screens";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Payment ${id}`,
    description: "Method, provider, amount, references, event log and refund action. Prototype data only.",
  };
}

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentDetail paymentId={id} />;
}
