"use client";

/**
 * Account overview. UI only.
 *
 * The profile, loyalty card and saved payment methods are simulated in
 * component state — there is no account service, no card vault and no stored
 * card data anywhere in this prototype. "Sign out" flips `sim.signedIn`.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MOCK_USER, branchById } from "@/lib/mock-data";
import { cn, etaRange } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge, Button, ButtonLink, Callout, Panel, Price, StatusBadge } from "@/components/ui/primitives";
import { OrderTracker } from "@/components/ui/data";
import { Segmented, TextField } from "@/components/ui/forms";
import { ConfirmDialog, Dialog } from "@/components/ui/overlays";
import { Avatar, PhotoStrip } from "@/components/ui/media";
import { Icon, type IconKey } from "@/components/ui/icons";
import {
  AccountHeader,
  AccountSignedOut,
  AccountSkeleton,
  formatDate,
  formatDateTime,
} from "./account-shell";
import { PhoneField, fullPhone, nationalDigits, phoneError } from "./auth-fields";

/** Everything that is still moving. Anything else belongs in history. */
const LIVE_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "WAITING_FOR_BRANCH",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "LALAMOVE_BOOKED",
  "RIDER_PICKED_UP",
  "OUT_FOR_DELIVERY",
];

const STAMP_TARGET = 10;

const QUICK_LINKS: { href: string; label: string; body: string; icon: IconKey }[] = [
  {
    href: "/account/orders",
    label: "Order history",
    body: "Receipts, refund references and reorder in two taps.",
    icon: "receipt",
  },
  {
    href: "/account/addresses",
    label: "Saved addresses",
    body: "Home, office and campus, with the notes the rider needs.",
    icon: "pin",
  },
  {
    href: "/account/notifications",
    label: "Notifications",
    body: "Choose what reaches you by push, email or SMS.",
    icon: "bell",
  },
  {
    href: "#payment-methods",
    label: "Payment methods",
    body: "Your saved Visa card and your DuitNow QR preference.",
    icon: "card",
  },
  {
    href: "/contact",
    label: "Help and contact",
    body: "Branch phone numbers, allergens, large orders and refunds.",
    icon: "phone",
  },
];

interface SavedMethod {
  id: string;
  kind: "visa" | "duitnow";
  title: string;
  detail: string;
  /** Provider line — visually secondary, per the payment rules. */
  provider: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AccountOverview() {
  const router = useRouter();
  const { hydrated, sim, patchSim, orders, activeOrderId, pushToast } = useStore();

  const [profile, setProfile] = useState({
    name: MOCK_USER.name,
    email: MOCK_USER.email,
    phone: MOCK_USER.phone,
  });
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [draftPhone, setDraftPhone] = useState(nationalDigits(profile.phone));
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const savedCard = useMemo(
    () => orders.find((o) => o.payment.maskedCard)?.payment.maskedCard ?? "•••• 4242",
    [orders],
  );

  const [methods, setMethods] = useState<SavedMethod[]>(() => [
    {
      id: "pm-visa",
      kind: "visa",
      title: `Visa ${savedCard}`,
      detail: "Expires 09/28 · Aisyah Rahman",
      provider: "Payment processed securely by Maybank",
    },
    {
      id: "pm-duitnow",
      kind: "duitnow",
      title: "DuitNow QR",
      detail: "Scan and pay from any Malaysian bank app",
      provider: "DuitNow QR powered by OXPay",
    },
  ]);
  const [preferredId, setPreferredId] = useState("pm-duitnow");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<SavedMethod | null>(null);

  const [newKind, setNewKind] = useState<"visa" | "duitnow">("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardErrors, setCardErrors] = useState<{
    number?: string;
    name?: string;
    expiry?: string;
  }>({});

  const [signOutOpen, setSignOutOpen] = useState(false);

  const liveOrder: Order | undefined = useMemo(() => {
    const active = orders.find((o) => o.id === activeOrderId && LIVE_STATUSES.includes(o.status));
    return active ?? orders.find((o) => LIVE_STATUSES.includes(o.status));
  }, [orders, activeOrderId]);

  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  /* ---------------------------------------------------------------- */

  if (!hydrated) {
    return (
      <div className="container-page py-10 lg:py-14">
        <AccountHeader
          title="MY ACCOUNT"
          lead="Your profile, your addresses, your receipts and your photo booth stamps."
        />
        <AccountSkeleton rows={4} />
      </div>
    );
  }

  if (!sim.signedIn) {
    return (
      <div className="container-page py-10 lg:py-14">
        <AccountHeader
          title="MY ACCOUNT"
          lead="Sign in to see your saved addresses, your receipts and your photo booth stamps."
        />
        <AccountSignedOut body="Your profile, addresses and order history live behind a sign-in. Nothing is lost — sign in and everything is where you left it." />
      </div>
    );
  }

  const openEdit = () => {
    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setDraftPhone(nationalDigits(profile.phone));
    setProfileErrors({});
    setEditing(true);
  };

  const saveProfile = () => {
    const next = {
      name: draftName.trim().length < 2 ? "Enter the name for your orders." : undefined,
      email: EMAIL_RE.test(draftEmail.trim())
        ? undefined
        : "Enter an email address, like you@example.com.",
      phone: phoneError(draftPhone),
    };
    setProfileErrors(next);
    if (next.name || next.email || next.phone) return;

    setProfile({
      name: draftName.trim(),
      email: draftEmail.trim(),
      phone: fullPhone(draftPhone),
    });
    setEditing(false);
    pushToast({
      tone: "success",
      title: "Profile updated",
      body: "Prototype only — the change stays in this browser session.",
    });
  };

  const addMethod = () => {
    if (newKind === "duitnow") {
      setMethods((prev) => [
        ...prev,
        {
          id: `pm-${Date.now()}`,
          kind: "duitnow",
          title: "DuitNow QR",
          detail: "Scan and pay from any Malaysian bank app",
          provider: "DuitNow QR powered by OXPay",
        },
      ]);
      setAdding(false);
      pushToast({ tone: "success", title: "DuitNow QR added as a payment option" });
      return;
    }

    const digits = cardNumber.replace(/\D/g, "");
    const next = {
      number: digits.length !== 16 ? "Enter the 16 digits on the front of the card." : undefined,
      name: cardName.trim().length < 2 ? "Enter the cardholder name exactly as printed." : undefined,
      expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)
        ? undefined
        : "Enter the expiry as MM/YY, for example 09/28.",
    };
    setCardErrors(next);
    if (next.number || next.name || next.expiry) return;

    setMethods((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        kind: "visa",
        title: `Visa •••• ${digits.slice(-4)}`,
        detail: `Expires ${cardExpiry} · ${cardName.trim()}`,
        provider: "Payment processed securely by Maybank",
      },
    ]);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardErrors({});
    setAdding(false);
    pushToast({
      tone: "success",
      title: "Card saved",
      body: "Prototype only — we keep the last four digits in memory and nothing else.",
    });
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <AccountHeader
        title="MY ACCOUNT"
        lead={`Signed in as ${profile.name}. Everything here is simulated — this prototype has no account service.`}
        trailing={
          <Badge tone="info" soft icon="user">
            Member since {formatDate(MOCK_USER.joinedOn)}
          </Badge>
        }
      />

      {/* ---------------------------------------------------------- */}
      {/* Active order                                                */}
      {/* ---------------------------------------------------------- */}
      {liveOrder && (
        <section aria-labelledby="live-order-title" className="mt-8">
          <div className="rounded-[16px] border border-deep/25 bg-mint p-5 lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-deep">
                  Happening now
                </p>
                <h2 id="live-order-title" className="mt-1.5 text-[22px]">
                  Order <span className="num">{liveOrder.code}</span>
                </h2>
                <p className="num mt-1 text-[14px] text-ink/75">
                  {branchById(liveOrder.branchId).name} ·{" "}
                  {liveOrder.fulfilment === "delivery" ? "Delivery" : "Pickup"} ·{" "}
                  {formatDateTime(liveOrder.placedAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={liveOrder.status} />
                <Price sen={liveOrder.total} />
              </div>
            </div>

            <div className="mt-5 rounded-[14px] bg-white/70 p-4">
              <OrderTracker
                status={liveOrder.status}
                fulfilment={liveOrder.fulfilment}
                events={liveOrder.events}
              />
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-ink/80">
              {liveOrder.status === "PENDING_PAYMENT"
                ? "This order is not paid yet, so nothing has reached the kitchen. You can still cancel it free of charge."
                : liveOrder.status === "WAITING_FOR_BRANCH"
                  ? `${branchById(liveOrder.branchId).shortName} has 5 minutes to accept. If they do not respond, the order is rejected automatically and refunded.`
                  : `Estimated ${liveOrder.fulfilment === "delivery" ? "delivery" : "collection"} in ${etaRange(branchById(liveOrder.branchId), liveOrder.fulfilment)}.`}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {liveOrder.status === "PENDING_PAYMENT" ? (
                <ButtonLink href={`/checkout/payment?order=${liveOrder.id}`} iconEnd="arrowRight">
                  Finish payment
                </ButtonLink>
              ) : (
                <ButtonLink href={`/track?code=${liveOrder.code}`} iconEnd="arrowRight">
                  Track this order
                </ButtonLink>
              )}
              <ButtonLink href="/account/orders" variant="secondary">
                All my orders
              </ButtonLink>
              <a
                href={`tel:${branchById(liveOrder.branchId).phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-deep underline underline-offset-2"
              >
                <Icon name="phone" size={15} />
                Call {branchById(liveOrder.branchId).shortName}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Profile + loyalty                                           */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar name={profile.name} size={64} />
              <button
                type="button"
                aria-label="Change your profile photo"
                onClick={() =>
                  pushToast({
                    tone: "neutral",
                    title: "Photo upload is not part of this prototype",
                    body: "The avatar is generated from your initials instead.",
                  })
                }
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-line bg-white text-deep hover:border-ink"
              >
                <Icon name="camera" size={14} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[22px] leading-snug">{profile.name}</h2>
              <dl className="mt-2 flex flex-col gap-1 text-[14px]">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Email address</dt>
                  <dd className="flex min-w-0 items-center gap-2 text-grey">
                    <Icon name="user" size={14} />
                    <span className="truncate">{profile.email}</span>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Mobile number</dt>
                  <dd className="num flex items-center gap-2 text-grey">
                    <Icon name="phone" size={14} />
                    {profile.phone}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-grey">
                Orders completed
              </p>
              <p className="num mt-1 font-display text-[22px] font-bold leading-none text-ink">
                {completedCount}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-grey">
                Favourite branch
              </p>
              <p className="mt-1 text-[15px] font-semibold text-ink">
                {branchById("ss15").shortName}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" iconStart="settings" onClick={openEdit}>
              Edit profile
            </Button>
            <Button
              variant="ghost"
              iconStart="lock"
              onClick={() =>
                pushToast({
                  tone: "neutral",
                  title: "Password changes are simulated",
                  body: "No credential is stored in this prototype, so there is nothing to change.",
                })
              }
            >
              Change password
            </Button>
          </div>
        </Panel>

        {/* Loyalty / stamp card */}
        <section
          aria-labelledby="loyalty-title"
          className="grain relative overflow-hidden rounded-[16px] bg-deep p-6 text-cream"
        >
          <div className="grain-layer" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-teal">
                  Make it last
                </p>
                <h2 id="loyalty-title" className="mt-1.5 font-display text-[22px] font-extrabold text-white">
                  PHOTO BOOTH STAMP CARD
                </h2>
              </div>
              <PhotoStrip frames={3} tilt={6} className="w-14" label="A photo booth strip" />
            </div>

            <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-cream/80">
              One stamp for every order you collect or receive. Ten stamps earns a free photo booth
              session with two printed strips.
            </p>

            <ol
              className="mt-5 grid grid-cols-5 gap-2"
              aria-label={`${MOCK_USER.loyaltyStrips} of ${STAMP_TARGET} stamps collected`}
            >
              {Array.from({ length: STAMP_TARGET }).map((_, i) => {
                const filled = i < MOCK_USER.loyaltyStrips;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-[10px] text-[13px] font-bold",
                      filled
                        ? "bg-teal text-ink"
                        : "border border-dashed border-white/35 text-cream/45",
                    )}
                  >
                    {filled ? <Icon name="camera" size={16} /> : <span className="num">{i + 1}</span>}
                    <span className="sr-only">
                      Stamp {i + 1} {filled ? "collected" : "not collected yet"}
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="mt-4 text-[15px] font-semibold text-white">
              <span className="num">{MOCK_USER.loyaltyStrips}</span> of{" "}
              <span className="num">{STAMP_TARGET}</span> stamps ·{" "}
              {STAMP_TARGET - MOCK_USER.loyaltyStrips} more to a free session
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-cream/65">
              Mock figure for the prototype. Stamps are added when a branch marks an order completed,
              and a full card is redeemed at the counter.
            </p>
            <div className="mt-5">
              <ButtonLink href="/photo-booth" variant="secondary" size="md">
                How the booth works
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Quick links                                                 */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="quick-links-title" className="mt-10">
        <h2 id="quick-links-title" className="text-[20px]">
          Manage your account
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex h-full min-h-24 items-start gap-3 rounded-[16px] border border-line bg-white p-4 transition-colors hover:border-ink"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint text-deep">
                  <Icon name={link.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[16px] font-semibold text-ink">{link.label}</span>
                    <span className="shrink-0 text-grey">
                      <Icon name="chevronRight" size={16} />
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-grey">
                    {link.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Payment methods                                             */}
      {/* ---------------------------------------------------------- */}
      <section id="payment-methods" aria-labelledby="payment-title" className="mt-10 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="payment-title" className="text-[20px]">
              Saved payment methods
            </h2>
            <p className="mt-1 max-w-[56ch] text-[14px] leading-relaxed text-grey">
              Two ways to pay: a Visa card or a DuitNow dynamic QR. Your preferred method is selected
              for you at checkout, and you can always switch there.
            </p>
          </div>
          <Button variant="secondary" iconStart="plus" onClick={() => setAdding(true)}>
            Add a method
          </Button>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {methods.map((method) => {
            const preferred = method.id === preferredId;
            return (
              <li key={method.id}>
                <div
                  className={cn(
                    "flex flex-wrap items-start gap-4 rounded-[16px] border bg-white p-4",
                    preferred ? "border-ink" : "border-line",
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-mint text-deep">
                    <Icon name={method.kind === "visa" ? "card" : "qr"} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="num text-[16px] font-semibold text-ink">{method.title}</p>
                      {preferred && (
                        <Badge tone="success" icon="check">
                          Preferred
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] text-grey">{method.detail}</p>
                    <p className="mt-1 text-[12px] text-grey">{method.provider}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!preferred && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setPreferredId(method.id);
                          pushToast({
                            tone: "success",
                            title: `${method.title} is now your preferred method`,
                          });
                        }}
                      >
                        Use by default
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      iconStart="trash"
                      onClick={() => setRemoving(method)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {methods.length === 0 && (
          <div className="mt-3">
            <Callout tone="warning" icon="card" title="No saved payment methods">
              You will be asked to choose Visa card or DuitNow QR at checkout instead. Nothing is
              blocked.
            </Callout>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-grey">
          <span className="mt-0.5 shrink-0 text-deep">
            <Icon name="shield" size={15} />
          </span>
          Prototype only: no card number is stored, transmitted or tokenised. The list keeps the last
          four digits in memory so the screen reads realistically, and it resets when you reload.
        </p>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Sign out                                                    */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="signout-title" className="mt-10 border-t border-line pt-6">
        <h2 id="signout-title" className="text-[18px]">
          Sign out
        </h2>
        <p className="mt-1.5 max-w-[60ch] text-[14px] leading-relaxed text-grey">
          Your cart stays on this device so you can pick it up later. Signing out only switches this
          prototype back to the guest path.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="dark" iconStart="logout" onClick={() => setSignOutOpen(true)}>
            Sign out
          </Button>
          <ButtonLink href="/contact" variant="ghost">
            Something looks wrong — contact us
          </ButtonLink>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Dialogs                                                     */}
      {/* ---------------------------------------------------------- */}
      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit your profile"
        description="Prototype only — changes stay in this browser session and nothing is sent anywhere."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={saveProfile}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            id="profile-name"
            label="Full name"
            required
            autoComplete="name"
            value={draftName}
            error={profileErrors.name}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <TextField
            id="profile-email"
            label="Email address"
            type="email"
            required
            autoComplete="email"
            hint="Receipts and refund confirmations go here."
            value={draftEmail}
            error={profileErrors.email}
            onChange={(e) => setDraftEmail(e.target.value)}
          />
          <PhoneField
            id="profile-phone"
            label="Mobile number"
            required
            value={draftPhone}
            error={profileErrors.phone}
            hint="The branch and the rider call this number."
            onChange={setDraftPhone}
          />
        </div>
      </Dialog>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a payment method"
        description="Simulated. No card data is handled — the prototype keeps the last four digits in component state only."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="dark" iconStart="plus" onClick={addMethod}>
              {newKind === "visa" ? "Save card" : "Add DuitNow QR"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Segmented
            label="Payment method type"
            value={newKind}
            onChange={setNewKind}
            full
            options={[
              { value: "visa", label: "Visa card", icon: "card" },
              { value: "duitnow", label: "DuitNow QR", icon: "qr" },
            ]}
          />

          {newKind === "visa" ? (
            <>
              <TextField
                id="new-card-number"
                label="Card number"
                required
                inputMode="numeric"
                autoComplete="off"
                maxLength={19}
                placeholder="4242 4242 4242 4242"
                className="num"
                hint="Any 16 digits work. Nothing is validated with a bank and nothing is stored."
                value={cardNumber}
                error={cardErrors.number}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ""))}
              />
              <TextField
                id="new-card-name"
                label="Cardholder name"
                required
                autoComplete="off"
                placeholder="As printed on the card"
                value={cardName}
                error={cardErrors.name}
                onChange={(e) => setCardName(e.target.value)}
              />
              <TextField
                id="new-card-expiry"
                label="Expiry date"
                required
                inputMode="numeric"
                maxLength={5}
                placeholder="MM/YY"
                className="num"
                hint="We do not ask for the CVV here — nothing is charged when you save a card."
                value={cardExpiry}
                error={cardErrors.expiry}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCardExpiry(
                    digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
                  );
                }}
              />
              <Callout tone="neutral" icon="lock" title="Payment processed securely by Maybank">
                In the live product the card would be tokenised by the bank and never reach our
                servers. In this prototype the form is illustrative only.
              </Callout>
            </>
          ) : (
            <Callout tone="info" icon="qr" title="DuitNow QR powered by OXPay">
              Nothing to fill in. At checkout we generate a dynamic QR for the exact amount, valid
              for 10 minutes, which you scan from any Malaysian bank app.
            </Callout>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return;
          const id = removing.id;
          setMethods((prev) => prev.filter((m) => m.id !== id));
          if (preferredId === id) {
            const next = methods.find((m) => m.id !== id);
            setPreferredId(next ? next.id : "");
          }
          pushToast({ tone: "warning", title: `${removing.title} removed` });
          setRemoving(null);
        }}
        title="Remove this payment method?"
        confirmLabel="Remove it"
        cancelLabel="Keep it"
        destructive
        body={
          <>
            <span className="num font-semibold">{removing?.title}</span> will be taken off your
            account. You can add it again at any time, and you can still pay with it at checkout by
            entering it there.
          </>
        }
      />

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          patchSim({ signedIn: false });
          pushToast({
            tone: "neutral",
            title: "Signed out",
            body: "You are on the guest path now. Your cart is still here.",
          });
          router.push("/");
        }}
        title="Sign out of BANG GA BANG GA?"
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        body={
          <>
            Your cart and your current order stay on this device. You will need your order code to
            track anything already placed — it is in the confirmation email.
            <span className="mt-2 block text-[13px] text-grey">
              Prototype: this only flips the simulated signed-in state. Nothing is revoked.
            </span>
          </>
        }
      />
    </div>
  );
}
