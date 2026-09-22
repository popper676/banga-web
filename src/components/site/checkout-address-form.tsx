"use client";

import { useState } from "react";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/primitives";
import { SelectField, TextAreaField, TextField } from "@/components/ui/forms";

const STATES = [
  "Selangor",
  "Kuala Lumpur",
  "Putrajaya",
  "Negeri Sembilan",
  "Perak",
  "Melaka",
  "Johor",
  "Penang",
];

interface Errors {
  label?: string;
  line1?: string;
  postcode?: string;
  city?: string;
}

/** Inline "add a new address" form used inside the checkout delivery block. */
export function CheckoutAddressForm({
  onAdd,
  onCancel,
}: {
  onAdd: (address: Omit<Address, "id">) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(STATES[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const next: Errors = {};
    if (!label.trim()) next.label = "Give this address a name, for example Home or Office.";
    if (!line1.trim()) next.line1 = "Enter the street address.";
    if (!/^\d{5}$/.test(postcode.trim())) next.postcode = "Enter a 5-digit Malaysian postcode.";
    if (!city.trim()) next.city = "Enter the city or town.";
    return next;
  };

  const submit = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onAdd({
      label: label.trim(),
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      postcode: postcode.trim(),
      city: city.trim(),
      state,
      notes: notes.trim() || undefined,
      isDefault: false,
    });
  };

  return (
    <div className="rounded-[14px] border border-line bg-cream/60 p-4">
      <h3 className="text-[16px]">Add a new address</h3>
      <p className="mt-1 text-[13px] text-grey">
        Saved to this device for the prototype only. Nothing is sent anywhere.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextField
          label="Address name"
          required
          placeholder="Home, Office, Campus"
          value={label}
          error={errors.label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, label: validate().label }))}
        />
        <TextField
          label="Address line 1"
          required
          placeholder="12 Jalan SS15/4"
          value={line1}
          error={errors.line1}
          onChange={(e) => setLine1(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, line1: validate().line1 }))}
        />
        <TextField
          label="Address line 2"
          placeholder="Unit, floor, building"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
        />
        <TextField
          label="Postcode"
          required
          inputMode="numeric"
          maxLength={5}
          placeholder="47500"
          value={postcode}
          error={errors.postcode}
          onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
          onBlur={() => setErrors((p) => ({ ...p, postcode: validate().postcode }))}
        />
        <TextField
          label="City"
          required
          placeholder="Subang Jaya"
          value={city}
          error={errors.city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, city: validate().city }))}
        />
        <SelectField
          label="State"
          required
          value={state}
          onChange={(e) => setState(e.target.value)}
          options={STATES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          label="Delivery notes for this address"
          hint="Gate code, landmark, or where the rider should wait."
          maxLength={160}
          showCount
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="dark" onClick={submit} iconStart="plus">
          Save address
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
