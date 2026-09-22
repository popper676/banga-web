import type { Metadata } from "next";
import { BranchesScreen } from "@/components/admin/config-system";

export const metadata: Metadata = {
  title: "Branch management",
  description: "Hours, radius, fees, pause switch and future branches.",
};

export default function AdminBranchesPage() {
  return <BranchesScreen />;
}
