import type { Metadata } from "next";
import { CartScreen } from "@/components/site/cart-screen";

export const metadata: Metadata = {
  title: "Your bag",
  description:
    "Review your BANG GA BANG GA order, change quantities, apply a promo code, choose pickup or delivery, and continue to checkout.",
};

export default function CartPage() {
  return <CartScreen />;
}
