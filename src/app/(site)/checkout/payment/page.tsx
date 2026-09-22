import type { Metadata } from "next";
import { PaymentScreen } from "@/components/site/payment-screen";

export const metadata: Metadata = {
  title: "Payment",
  description:
    "Pay securely with Visa or scan a DuitNow dynamic QR. Simulated payment states for the BANG GA BANG GA prototype.",
};

/** Next 16 passes `searchParams` as a Promise — await it, then hand values to the client. */
export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <PaymentScreen orderId={order ?? null} />;
}
