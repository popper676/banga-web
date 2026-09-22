import type { Metadata } from "next";
import { RefundsScreen } from "@/components/admin/money-screens";

export const metadata: Metadata = {
  title: "Refunds",
  description: "Automatic and manual refunds with an approval workflow. Mock data only.",
};

export default function AdminRefundsPage() {
  return <RefundsScreen />;
}
