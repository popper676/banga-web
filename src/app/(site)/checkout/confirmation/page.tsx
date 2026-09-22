import type { Metadata } from "next";
import { ConfirmationScreen } from "@/components/site/confirmation-screen";

export const metadata: Metadata = {
  title: "Waiting for the branch",
  description:
    "Payment received. The branch has five minutes to confirm your BANG GA BANG GA order.",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <ConfirmationScreen orderId={order ?? null} />;
}
