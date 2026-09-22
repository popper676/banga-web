"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Address } from "@/lib/types";
import { Badge, Button, EmptyState, Panel } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/forms";
import { ConfirmDialog } from "@/components/ui/overlays";
import { AccountHeader, AccountSignedOut, AccountSkeleton } from "./account-shell";

const BLANK: Omit<Address, "id"> = {
  label: "",
  line1: "",
  city: "Subang Jaya",
  postcode: "47500",
  state: "Selangor",
  notes: "",
  isDefault: false,
};

export function AccountAddresses() {
  const { hydrated, sim, addresses, addAddress, pushToast } = useStore();
  const [form, setForm] = useState(BLANK);
  const [adding, setAdding] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [local, setLocal] = useState<Address[] | null>(null);
  const list = local ?? addresses;

  if (!hydrated) return <AccountSkeleton />;
  if (!sim.signedIn) {
    return (
      <div className="container-page py-10">
        <AccountHeader title="Saved addresses" lead="Home, campus and office, with the notes the rider needs." />
        <AccountSignedOut body="Sign in to save addresses across devices." />
      </div>
    );
  }

  const setDefault = (id: string) => {
    setLocal(list.map((a) => ({ ...a, isDefault: a.id === id })));
    pushToast({ tone: "success", title: "Default address updated" });
  };

  const save = () => {
    if (!form.label || !form.line1 || !form.postcode) return;
    addAddress(form);
    setForm(BLANK);
    setAdding(false);
    pushToast({ tone: "success", title: `${form.label} saved` });
  };

  return (
    <div className="container-page py-10 lg:py-12">
      <AccountHeader
        title="Saved addresses"
        lead="The rider uses the pin, the unit number and the notes. Manual entry always works if location permission is off."
        trailing={
          <Button size="sm" iconStart="plus" onClick={() => setAdding(true)}>
            Add address
          </Button>
        }
      />

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="pin"
            title="No saved addresses"
            body="Add one so checkout does not ask again."
            action={
              <Button onClick={() => setAdding(true)} iconStart="plus">
                Add an address
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {list.map((a) => (
            <li key={a.id}>
              <Panel className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[18px]">{a.label}</h2>
                  {a.isDefault && (
                    <Badge tone="info" icon="check" soft>
                      Default
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/80">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.postcode} {a.city}, {a.state}
                </p>
                {a.notes && <p className="mt-2 text-[13px] italic text-grey">{a.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {!a.isDefault && (
                    <Button size="sm" variant="secondary" onClick={() => setDefault(a.id)}>
                      Set as default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setRemoveId(a.id)}>
                    Remove
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <Panel className="mt-6 grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-[18px]">New address</h2>
          <TextField label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home" required />
          <TextField label="Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required wrapperClassName="sm:col-span-2" />
          <TextField label="Postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} inputMode="numeric" />
          <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <TextField
            label="Notes for the rider"
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            wrapperClassName="sm:col-span-2"
          />
          <div className="sm:col-span-2 flex gap-2">
            <Button onClick={save}>Save address</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Panel>
      )}

      <ConfirmDialog
        open={Boolean(removeId)}
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          setLocal(list.filter((a) => a.id !== removeId));
          pushToast({ tone: "success", title: "Address removed" });
        }}
        title="Remove this address?"
        body="It will no longer appear at checkout. Past receipts keep the original snapshot."
        confirmLabel="Remove address"
        destructive
      />
    </div>
  );
}
