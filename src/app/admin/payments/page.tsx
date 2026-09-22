import type { Metadata } from "next";
import { PaymentsScreen } from "@/components/admin/money-screens";

export const metadata: Metadata = {
  title: "Payments",
  description: "Visa via Maybank and DuitNow QR via OXPay — every attempt, reference and settlement mismatch.",
};

export default function AdminPaymentsPage() {
  return <PaymentsScreen />;
}
