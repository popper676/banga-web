import type { Metadata } from "next";
import { AccountOrders } from "@/components/site/account-orders";

export const metadata: Metadata = { title: "Order history" };
export default function Page() {
  return <AccountOrders />;
}
