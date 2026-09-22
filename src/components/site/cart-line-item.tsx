"use client";

import { useState } from "react";
import { branchById, productById } from "@/lib/mock-data";
import { cn, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CartLine } from "@/lib/types";
import { AvailabilityChip, Badge, Button } from "@/components/ui/primitives";
import { QuantityStepper, TextAreaField } from "@/components/ui/forms";
import { FoodImage } from "@/components/ui/media";
import { Icon } from "@/components/ui/icons";
import { CartSwapDialog } from "./cart-swap-dialog";

const SPICE_WORDS = ["No heat", "Mild", "Medium", "Hot"];

export function CartLineItem({ line }: { line: CartLine }) {
  const { branchId, updateQuantity, removeLine, addLine, pushToast } = useStore();

  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(line.notes ?? "");
  const [swapping, setSwapping] = useState(false);

  const product = productById(line.productId);
  const branch = branchById(branchId);
  const availability = product?.availability[branchId] ?? "available";
  const unavailable = Boolean(line.unavailableAt) || availability === "sold_out";

  /** The line minus its id — what the store needs to put it back. */
  const payload = {
    productId: line.productId,
    name: line.name,
    image: line.image,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    options: line.options,
    notes: line.notes,
  };

  const spiceChoice = line.options.find((o) => o.groupId === "spice");
  const spiceText = spiceChoice?.choiceName ?? (product ? SPICE_WORDS[product.spiceLevel] : null);
  const extras = line.options.filter((o) => o.groupId !== "spice");

  const remove = () => {
    removeLine(line.lineId);
    pushToast({
      tone: "neutral",
      title: `${line.name} removed`,
      body: `${line.quantity} × ${money(line.unitPrice)} taken out of your bag.`,
      actionLabel: "Undo",
      onAction: () => addLine(payload),
    });
  };

  // The store keeps lines immutable, so a note change is a remove plus an add.
  const saveNote = () => {
    const next = noteDraft.trim();
    removeLine(line.lineId);
    addLine({ ...payload, notes: next || undefined });
    setEditingNote(false);
    pushToast({
      tone: "success",
      title: next ? "Note sent to the kitchen" : "Note removed",
      body: next ? `“${next}”` : undefined,
    });
  };

  return (
    <li
      className={cn(
        "flex flex-col gap-3 border-b border-line py-5 last:border-0 sm:flex-row sm:gap-4",
        unavailable && "opacity-95",
      )}
    >
      <FoodImage
        src={line.image}
        alt={line.name}
        className={cn("size-20 shrink-0 sm:size-24", unavailable && "saturate-50")}
        rounded="rounded-[12px]"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h3 className="text-[17px] leading-snug">{line.name}</h3>
          <p className="num shrink-0 text-[17px] font-semibold text-ink">
            {unavailable ? (
              <span className="text-grey line-through">{money(line.unitPrice * line.quantity)}</span>
            ) : (
              money(line.unitPrice * line.quantity)
            )}
          </p>
        </div>

        {extras.length > 0 && (
          <p className="mt-1 text-[13px] leading-snug text-grey">
            {extras.map((o) => o.choiceName).join(" · ")}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {spiceText && (
            <Badge tone="neutral" soft icon={spiceText === "No heat" ? "check" : "alert"}>
              Spice: {spiceText}
            </Badge>
          )}
          {!unavailable && <AvailabilityChip state={availability} branchName={branch.shortName} />}
          <span className="num text-[13px] text-grey">{money(line.unitPrice)} each</span>
        </div>

        {unavailable && (
          <p
            role="status"
            className="mt-3 flex items-start gap-2 rounded-[10px] border border-cta/30 bg-cta/8 px-3 py-2 text-[13px] font-medium leading-snug text-ink"
          >
            <span className="mt-px shrink-0 text-cta">
              <Icon name="alert" size={14} />
            </span>
            Sold out at {branch.shortName} today. It is not counted in your total — remove it or
            swap it for something similar.
          </p>
        )}

        {line.notes && !editingNote && (
          <p className="mt-2 flex items-start gap-1.5 text-[13px] italic leading-snug text-grey">
            <span className="mt-0.5 shrink-0 not-italic text-deep">
              <Icon name="receipt" size={13} />
            </span>
            “{line.notes}”
          </p>
        )}

        {editingNote ? (
          <div className="mt-3 rounded-[12px] border border-line bg-cream/70 p-3">
            <TextAreaField
              label={`Note for the kitchen — ${line.name}`}
              hint="Allergies, sauce on the side, cut it in half. The branch sees this with the order ticket."
              maxLength={120}
              showCount
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={saveNote} iconStart="check">
                Save note
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingNote(false);
                  setNoteDraft(line.notes ?? "");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {unavailable ? (
              <span className="num inline-flex h-11 items-center rounded-full border border-line bg-cream px-4 text-[14px] font-semibold text-grey">
                Qty {line.quantity}
                <span className="sr-only"> — quantity is locked while this dish is unavailable</span>
              </span>
            ) : (
              <QuantityStepper
                value={line.quantity}
                onChange={(v) => updateQuantity(line.lineId, v)}
                removeAtMin={remove}
                label={`Quantity for ${line.name}`}
              />
            )}

            {unavailable && (
              <Button variant="secondary" iconStart="refund" onClick={() => setSwapping(true)}>
                Swap for a similar dish
              </Button>
            )}

            {!unavailable && (
              <Button
                variant="ghost"
                iconStart="receipt"
                onClick={() => {
                  setNoteDraft(line.notes ?? "");
                  setEditingNote(true);
                }}
              >
                {line.notes ? "Edit note" : "Add a note"}
              </Button>
            )}

            <Button variant="ghost" iconStart="trash" onClick={remove}>
              Remove
              <span className="sr-only"> {line.name}</span>
            </Button>
          </div>
        )}
      </div>

      {swapping && (
        <CartSwapDialog open={swapping} onClose={() => setSwapping(false)} line={line} />
      )}
    </li>
  );
}
