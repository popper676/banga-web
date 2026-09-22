"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/primitives";

/**
 * Sets the active branch in the prototype store, then sends the customer to
 * the menu. Nothing is persisted server side — this is UI state only.
 */
export function BranchOrderButton({
  branchId,
  branchName,
  size = "lg",
}: {
  branchId: string;
  branchName: string;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const { setBranchId, pushToast, sim } = useStore();

  return (
    <Button
      size={size}
      iconEnd="arrowRight"
      onClick={() => {
        setBranchId(branchId);
        pushToast({
          tone: sim.offline ? "warning" : "success",
          title: `Now ordering from ${branchName}`,
          body: sim.offline
            ? "You are offline, so the menu will show the last saved version."
            : "Prices and availability now match this branch.",
        });
        router.push("/menu");
      }}
    >
      Order from this branch
    </Button>
  );
}
