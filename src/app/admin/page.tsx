import type { Metadata } from "next";
import { OpsDashboard } from "@/components/admin/ops-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Today's orders, revenue, orders awaiting branch confirmation, late orders and refunds across both branches.",
};

export default function AdminDashboardPage() {
  return <OpsDashboard />;
}