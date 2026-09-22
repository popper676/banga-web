import type { Metadata } from "next";
import { OrderList } from "@/components/admin/order-list";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "Filter, search and act on every order from both branches — status, payment, fulfilment, bulk print and CSV export.",
};

export default function AdminOrdersPage() {
  return <OrderList />;
}