import type { Metadata } from "next";
import { CategoriesScreen } from "@/components/admin/catalogue-categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Prototype admin screen for menu sections, their order and visibility.",
};

export default function AdminCategoriesPage() {
  return <CategoriesScreen />;
}
