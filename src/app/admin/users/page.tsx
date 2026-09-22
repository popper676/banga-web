import type { Metadata } from "next";
import { UsersScreen } from "@/components/admin/config-system";

export const metadata: Metadata = {
  title: "Admins & roles",
  description: "Staff accounts, branch scope and the permission matrix.",
};

export default function AdminUsersPage() {
  return <UsersScreen />;
}
