import type { Metadata } from "next";
import { AccountOverview } from "@/components/site/account-overview";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Your BANG GA BANG GA profile, live order, photo booth stamp card, saved payment methods and quick links to addresses, orders and notifications.",
};

export default function AccountPage() {
  return <AccountOverview />;
}
