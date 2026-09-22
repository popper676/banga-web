import type { Metadata } from "next";
import { DeliveryBoard } from "@/components/admin/ops-delivery";

export const metadata: Metadata = {
  title: "Delivery tracking",
  description: "Lalamove quotations, bookings and live rider status. Mock data only.",
};

export default function AdminDeliveryPage() {
  return <DeliveryBoard />;
}
