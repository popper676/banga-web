import type { Metadata } from "next";
import { MenuScreen } from "@/components/admin/catalogue-menu";

export const metadata: Metadata = {
  title: "Menu management",
  description:
    "Prototype admin screen for dish pricing, per-branch availability, options and publishing.",
};

export default function AdminMenuPage() {
  return <MenuScreen />;
}
