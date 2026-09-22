import type { Metadata } from "next";
import { MobileGallery } from "@/components/mobile/gallery";

export const metadata: Metadata = {
  title: "Android frames",
  description: "Complete Android screen set in 360×800 device frames.",
};

export default function MobileAndroidPage() {
  return <MobileGallery platform="android" />;
}
