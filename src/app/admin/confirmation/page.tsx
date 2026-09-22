import type { Metadata } from "next";
import { ConfirmationQueue } from "@/components/admin/ops-confirmation";

export const metadata: Metadata = {
  title: "Branch confirmation",
  description: "Accept or reject incoming paid orders inside the five-minute response window.",
};

export default function AdminConfirmationPage() {
  return <ConfirmationQueue />;
}
