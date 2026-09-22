import type { Metadata } from "next";
import { MobileFlow } from "@/components/mobile/gallery";

export const metadata: Metadata = {
  title: "Ordering flow",
  description: "The full order journey laid out left to right for iOS and Android.",
};

export default function MobileFlowPage() {
  return <MobileFlow />;
}
