"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Button, Callout, ErrorState, Panel } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/forms";

export function TrackOrderScreen() {
  const router = useRouter();
  const { sim, orders } = useStore();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const find = () => {
    setError(null);
    const c = code.trim().toUpperCase();
    const p = phone.replace(/\D/g, "");
    if (c.length < 6 || p.length < 8) {
      setError("Enter the full order code and the phone number used at checkout.");
      return;
    }
    if (sim.offline) {
      setError("Tracking needs a connection. Try again when you are back online.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const match = [...orders, ...MOCK_ORDERS].find(
        (o) => o.code.toUpperCase() === c && o.customerPhone.replace(/\D/g, "").endsWith(p.slice(-4)),
      );
      setLoading(false);
      if (!match) {
        setError("We could not find an order with that code and phone number.");
        return;
      }
      router.push(`/orders/${match.id}`);
    }, 700);
  };

  return (
    <div className="container-page max-w-xl py-12 lg:py-16">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">Guest tracking</p>
      <h1 className="mt-2 text-[clamp(28px,4vw,44px)] leading-tight">Find my order</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink/80">
        Enter the order code from your receipt or confirmation email, plus the phone number you used
        at checkout. Guests can add the order to an account afterwards.
      </p>

      <Panel className="mt-8 flex flex-col gap-4 p-6">
        <TextField
          label="Order code"
          placeholder="BG-260921-0138"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint="Shown on your receipt and in the confirmation email."
        />
        <TextField
          label="Phone number"
          placeholder="+60 12-345 6789"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && (
          <ErrorState
            title="Order not found"
            body={error}
            requestId="TRK-404-21"
            onRetry={find}
            retryLabel="Try again"
          />
        )}
        <Button onClick={find} loading={loading} full>
          Find my order
        </Button>
      </Panel>

      <Callout tone="info" className="mt-6" title="Signed-in shortcut">
        If you have an account, every order is already under{" "}
        <a href="/account/orders" className="font-semibold underline">
          Order history
        </a>
        . Try code <span className="num font-semibold">BG-260921-0136</span> with a phone ending{" "}
        <span className="num font-semibold">4410</span> to see a live delivery.
      </Callout>
    </div>
  );
}
