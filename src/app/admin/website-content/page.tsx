import type { Metadata } from "next";
import { WebsiteContentScreen } from "@/components/admin/website-content";

export const metadata: Metadata = {
  title: "Website Content",
  description: "Manage website copy, navigation and media slots.",
};

export default function WebsiteContentPage() {
  return <WebsiteContentScreen />;
}
