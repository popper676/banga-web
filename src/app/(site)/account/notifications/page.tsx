import type { Metadata } from "next";
import { AccountNotifications } from "@/components/site/account-notifications";

export const metadata: Metadata = { title: "Notifications" };
export default function Page() {
  return <AccountNotifications />;
}
