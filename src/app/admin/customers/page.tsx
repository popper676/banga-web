import type { Metadata } from "next";
import { CustomersScreen } from "@/components/admin/config-crm";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer records, history, addresses and support actions. Prototype data only.",
};

export default function AdminCustomersPage() {
  return <CustomersScreen />;
}
