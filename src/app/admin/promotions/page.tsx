import type { Metadata } from "next";
import { PromotionsScreen } from "@/components/admin/config-crm";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Codes, conditions, windows, caps and a customer-facing preview.",
};

export default function AdminPromotionsPage() {
  return <PromotionsScreen />;
}
