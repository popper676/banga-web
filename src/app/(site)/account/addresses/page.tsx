import type { Metadata } from "next";
import { AccountAddresses } from "@/components/site/account-addresses";

export const metadata: Metadata = { title: "Saved addresses" };
export default function Page() {
  return <AccountAddresses />;
}
