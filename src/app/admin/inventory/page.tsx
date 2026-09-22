import type { Metadata } from "next";
import { InventoryScreen } from "@/components/admin/catalogue-inventory";

export const metadata: Metadata = {
  title: "Branch inventory",
  description:
    "Prototype admin screen for per-branch stock states, low-stock rules and the daily reset.",
};

export default function AdminInventoryPage() {
  return <InventoryScreen />;
}
