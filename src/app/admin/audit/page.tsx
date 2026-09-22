import type { Metadata } from "next";
import { AuditScreen } from "@/components/admin/config-system";

export const metadata: Metadata = {
  title: "Audit logs",
  description: "Immutable record of who changed what, with before and after values.",
};

export default function AdminAuditPage() {
  return <AuditScreen />;
}
