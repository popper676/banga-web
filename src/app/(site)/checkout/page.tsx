import type { Metadata } from "next";
import { CheckoutScreen } from "@/components/site/checkout-screen";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Choose pickup or delivery, confirm your branch and contact details, then continue to payment.",
};

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
