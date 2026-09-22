import type { Metadata } from "next";
import { KitchenBoard } from "@/components/admin/ops-kitchen";

export const metadata: Metadata = {
  title: "Kitchen status",
  description: "Glanceable board from confirmed through to handed over.",
};

export default function AdminKitchenPage() {
  return <KitchenBoard />;
}
