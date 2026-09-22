import type { Metadata } from "next";
import { PrinterScreen } from "@/components/admin/config-system";

export const metadata: Metadata = {
  title: "Printer & POS",
  description: "Devices, routing rules, test prints and the retry queue.",
};

export default function AdminPrinterPage() {
  return <PrinterScreen />;
}
