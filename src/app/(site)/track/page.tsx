import type { Metadata } from "next";
import { TrackOrderScreen } from "@/components/site/track-screen";

export const metadata: Metadata = {
  title: "Find my order",
  description: "Track a BANG GA BANG GA order with the order code and phone number used at checkout.",
};

export default function TrackPage() {
  return <TrackOrderScreen />;
}
