import type { Metadata } from "next";
import { OptionsScreen } from "@/components/admin/catalogue-options";

export const metadata: Metadata = {
  title: "Options & add-ons",
  description:
    "Prototype admin screen for option groups, selection rules, price deltas and per-branch availability.",
};

export default function AdminOptionsPage() {
  return <OptionsScreen />;
}
