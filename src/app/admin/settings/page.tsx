import type { Metadata } from "next";
import { SettingsScreen } from "@/components/admin/config-system";

export const metadata: Metadata = {
  title: "System settings",
  description: "Ordering rules, payment and delivery providers, tax, templates and maintenance.",
};

export default function AdminSettingsPage() {
  return <SettingsScreen />;
}
