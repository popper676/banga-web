import type { Metadata } from "next";
import { MobileGallery } from "@/components/mobile/gallery";

export const metadata: Metadata = {
  title: "iOS frames",
  description: "Complete iOS screen set in 393×852 device frames.",
};

export default function MobileIosPage() {
  return <MobileGallery platform="ios" />;
}
