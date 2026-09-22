import type { Metadata } from "next";
import { ReportsScreen } from "@/components/admin/money-screens";

export const metadata: Metadata = {
  title: "Reports",
  description: "Revenue, mix, prep time and refund rate from typed mock figures.",
};

export default function AdminReportsPage() {
  return <ReportsScreen />;
}
