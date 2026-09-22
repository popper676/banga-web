"use client";

import { useState } from "react";
import { ORDER_STATUS, PAYMENT_STATUS, AVAILABILITY, TRANSITIONS, REJECTION_REASONS } from "@/lib/status";
import { MOCK_ORDERS, PRODUCTS } from "@/lib/mock-data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import {
  AvailabilityChip,
  Badge,
  Button,
  Callout,
  Divider,
  EmptyState,
  ErrorState,
  KeyValue,
  Panel,
  PaymentBadge,
  Price,
  PromoBadge,
  Skeleton,
  SkeletonCard,
  Stat,
  StatusBadge,
} from "@/components/ui/primitives";
import {
  ChoiceRow,
  Chip,
  QuantityStepper,
  Segmented,
  SelectField,
  TextAreaField,
  TextField,
  Toggle,
} from "@/components/ui/forms";
import { BottomSheet, ConfirmDialog, Dialog, Drawer } from "@/components/ui/overlays";
import { DataTable, OrderTracker, Pagination, TotalsBlock, IconStat, EventTimeline } from "@/components/ui/data";
import { Avatar, MapView, QRCode } from "@/components/ui/media";
import { ProductCard } from "@/components/site/product-card";
import { DoDont, DsGrid, DsItem, DsSection, TokenTable } from "./kit";

/* ================================================================== */
/* Buttons and actions                                                 */
/* ================================================================== */

export function ButtonSection() {
  const [loading, setLoading] = useState(false);

  return (
    <DsSection
      id="buttons"
      number="07"
      title="Buttons and actions"
      lead="Five variants, three sizes, one rule: exactly one primary action per view. Every button is at least 44px tall and keeps its label visible while loading so the width does not jump."
    >
      <DsGrid cols={2}>
        <DsItem
          name="Variants"
          spec="primary · dark · secondary · ghost · destructive"
          usage="Primary is CTA coral and belongs to the single most important action. Dark ink is for confirmations inside a flow. Secondary is an outline. Ghost is for tertiary links. Destructive is reserved for actions that cost a customer money or an order."
        >
          <Button>Add to cart</Button>
          <Button variant="dark">Continue to payment</Button>
          <Button variant="secondary">Change branch</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="destructive">Reject order</Button>
        </DsItem>

        <DsItem
          name="Sizes and icons"
          spec="sm 44 · md 48 · lg 56 · iconStart / iconEnd"
          usage="Large is used for the single commit action on payment and checkout. Icons sit on the leading edge for meaning and the trailing edge for direction."
        >
          <Button size="sm" iconStart="plus">
            Small
          </Button>
          <Button size="md" iconEnd="arrowRight">
            Medium
          </Button>
          <Button size="lg" iconStart="lock">
            Pay RM 48.90
          </Button>
        </DsItem>

        <DsItem
          name="States"
          spec="rest · hover · focus-visible · loading · disabled"
          usage="Disabled buttons always sit next to a sentence explaining why, because a dead button with no reason is the most common accessibility failure in ordering flows."
        >
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1600);
            }}
          >
            {loading ? "Checking with Maybank" : "Press to load"}
          </Button>
          <div className="flex flex-col gap-1">
            <Button disabled>Checkout</Button>
            <span className="text-[12px] text-grey">SS15 is closed until 11:00</span>
          </div>
        </DsItem>

        <DsItem
          name="Full width and bars"
          spec="full · sticky bottom bar on mobile"
          usage="On phone frames the commit action lives in a sticky bar with the running total beside it, so the price is never scrolled out of view at the moment of decision."
          surface="cream"
        >
          <div className="w-full max-w-sm rounded-[14px] border border-line bg-white p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[13px] text-grey">3 items</span>
              <Price sen={4890} />
            </div>
            <Button full size="lg" iconEnd="arrowRight">
              Continue to payment
            </Button>
          </div>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Status system                                                       */
/* ================================================================== */

export function StatusSection() {
  const statuses = Object.keys(ORDER_STATUS) as OrderStatus[];

  return (
    <DsSection
      id="status"
      number="08"
      title="Status system"
      lead={
        <>
          The order lifecycle has {statuses.length} states. Customers see plain English, staff see
          operational language, and the same token drives the colour, the icon and the words, so a
          status can never look one way and read another.
        </>
      }
    >
      <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">
            Every order status with the wording shown to customers and to staff, and the legal next
            states
          </caption>
          <thead>
            <tr className="border-b border-line bg-cream/60">
              {["Token", "Customer sees", "Staff sees", "Legal next states"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-grey"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statuses.map((s) => (
              <tr key={s} className="border-b border-line last:border-0">
                <td className="px-4 py-2.5 align-top">
                  <span className="num text-[12px] text-grey">{s}</span>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <StatusBadge status={s} />
                </td>
                <td className="px-4 py-2.5 align-top">
                  <StatusBadge status={s} audience="admin" soft />
                </td>
                <td className="px-4 py-2.5 align-top">
                  {TRANSITIONS[s]?.length ? (
                    <span className="num text-[12px] leading-relaxed text-ink">
                      {TRANSITIONS[s]!.join(", ")}
                    </span>
                  ) : (
                    <span className="text-[12px] italic text-grey">Terminal state</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DsGrid cols={3}>
        <DsItem name="Payment status" spec="PaymentBadge" usage="Mirrors the provider's own vocabulary so support can match a screen to a bank statement.">
          {(Object.keys(PAYMENT_STATUS) as (keyof typeof PAYMENT_STATUS)[]).map((k) => (
            <PaymentBadge key={k} status={k} />
          ))}
        </DsItem>

        <DsItem
          name="Availability"
          spec="AvailabilityChip · renders nothing when available"
          usage="Per branch, not per brand. A dish sold out at SS15 can still be available at Taylor's, so the chip names the branch."
        >
          {(Object.keys(AVAILABILITY) as (keyof typeof AVAILABILITY)[]).map((k) =>
            k === "available" ? (
              <Badge key={k} tone="success" icon="check" soft>
                Available (no chip shown)
              </Badge>
            ) : (
              <AvailabilityChip key={k} state={k} branchName="SS15" />
            ),
          )}
        </DsItem>

        <DsItem name="Promotion and generic badges" spec="PromoBadge · Badge tones" usage="Yellow is promotional. Tones carry meaning: info, success, warning, danger.">
          <PromoBadge>20% off</PromoBadge>
          <Badge tone="info" icon="sparkle">
            New
          </Badge>
          <Badge tone="success" icon="check" soft>
            Halal certified
          </Badge>
          <Badge tone="warning" icon="alert" soft>
            Running low
          </Badge>
          <Badge tone="danger" icon="cross">
            Sold out
          </Badge>
        </DsItem>
      </DsGrid>

      <DsItem
        name="Customer order tracker"
        spec="OrderTracker · horizontal on desktop, vertical on mobile"
        usage="Rendered as an ordered list so screen readers announce position and total. The step label changes for pickup orders, which have four steps instead of five."
        wide
      >
        <div className="w-full">
          <OrderTracker status="OUT_FOR_DELIVERY" fulfilment="delivery" />
          <Divider className="my-5" />
          <OrderTracker status="READY" fulfilment="pickup" />
        </div>
      </DsItem>

      <DoDont
        dos={[
          "Always pair the status colour with its icon and its words.",
          "Offer only the transitions the state machine allows, and explain the rest.",
          "Use the customer wording in customer surfaces and the staff wording in the console.",
          "Show a reason with every rejection, cancellation and refund.",
        ]}
        donts={[
          "Never invent a status that the backend cannot produce.",
          "Never show a raw token like WAITING_FOR_BRANCH to a customer.",
          "Never let a terminal state offer a forward action.",
          "Never signal 'late' with red text alone.",
        ]}
      />
    </DsSection>
  );
}

/* ================================================================== */
/* Forms                                                               */
/* ================================================================== */

export function FormSection() {
  const [qty, setQty] = useState(2);
  const [spice, setSpice] = useState("medium");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [addons, setAddons] = useState<string[]>(["cheese"]);
  const [sms, setSms] = useState(true);
  const [filter, setFilter] = useState("all");

  const toggleAddon = (id: string) =>
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <DsSection
      id="forms"
      number="09"
      title="Forms and inputs"
      lead="Labels are always visible, never placeholders. Errors appear under the field, are announced, and are linked to the input with aria-describedby. Required is marked in words as well as with an asterisk."
    >
      <DsGrid cols={2}>
        <DsItem name="Text fields" spec="TextField · label, hint, error, iconStart, suffix" usage="Hints explain format before the customer types. Errors replace the hint and never move the layout.">
          <div className="flex w-full flex-col gap-3">
            <TextField label="Full name" required defaultValue="Nurul Aisyah binti Hamid" />
            <TextField
              label="Mobile number"
              required
              hint="We send order updates to this number"
              iconStart="phone"
              defaultValue="12 345 6789"
              suffix={<span className="num text-[13px] text-grey">+60</span>}
            />
            <TextField
              label="Promo code"
              defaultValue="BANGGA5"
              error="That code expired on 30 September"
            />
          </div>
        </DsItem>

        <DsItem name="Select, textarea, counter" spec="SelectField · TextAreaField with showCount" usage="Kitchen notes are capped and counted, because the thermal ticket has a fixed width.">
          <div className="flex w-full flex-col gap-3">
            <SelectField
              label="Delivery time"
              options={[
                { value: "asap", label: "As soon as possible (35 to 45 minutes)" },
                { value: "1830", label: "Today, 6:30 pm" },
                { value: "1900", label: "Today, 7:00 pm" },
              ]}
            />
            <TextAreaField
              label="Note for the kitchen"
              hint="Allergies, spice level, doorbell instructions"
              showCount
              maxLength={140}
              rows={3}
              defaultValue="Please make it less spicy for the kids, and no spring onion."
            />
          </div>
        </DsItem>

        <DsItem name="Choice rows" spec="ChoiceRow radio and checkbox · priceDelta · disabledReason" usage="Used for spice level, rice choice, add-ons and payment method. A disabled option always states why it cannot be chosen.">
          <div className="flex w-full flex-col gap-2.5">
            {[
              { id: "mild", title: "Mild", description: "Barely a tingle" },
              { id: "medium", title: "Medium", description: "The house default" },
              { id: "fire", title: "Buldak fire", description: "Genuinely very hot" },
            ].map((o) => (
              <ChoiceRow
                key={o.id}
                name="ds-spice"
                checked={spice === o.id}
                onChange={() => setSpice(o.id)}
                title={o.title}
                description={o.description}
              />
            ))}
            <ChoiceRow
              type="checkbox"
              checked={addons.includes("cheese")}
              onChange={() => toggleAddon("cheese")}
              title="Extra mozzarella"
              priceDelta={400}
            />
            <ChoiceRow
              type="checkbox"
              checked={false}
              onChange={() => {}}
              disabled
              disabledReason="Sold out at SS15 today"
              title="Soft-boiled egg"
              priceDelta={250}
            />
          </div>
        </DsItem>

        <DsItem name="Segmented, chips, stepper, toggle" spec="Segmented · Chip · QuantityStepper · Toggle" usage="Segmented controls switch a whole view. Chips filter within one. Steppers change quantity without a keyboard.">
          <div className="flex w-full flex-col gap-4">
            <Segmented
              label="Fulfilment"
              full
              value={mode}
              onChange={setMode}
              options={[
                { value: "delivery", label: "Delivery", icon: "bike", hint: "35 to 45 min" },
                { value: "pickup", label: "Pickup", icon: "bag", hint: "15 min" },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Everything", count: 42 },
                { id: "chicken", label: "Fried chicken", count: 9 },
                { id: "rice", label: "Rice bowls", count: 7 },
                { id: "halal", label: "Halal certified", count: 42 },
              ].map((c) => (
                <Chip
                  key={c.id}
                  active={filter === c.id}
                  onClick={() => setFilter(c.id)}
                  count={c.count}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper value={qty} onChange={setQty} />
              <QuantityStepper value={1} onChange={() => {}} size="sm" removeAtMin={() => {}} />
            </div>
            <Toggle
              checked={sms}
              onChange={setSms}
              label="Send order updates by SMS"
              description="Order status messages cannot be switched off"
            />
          </div>
        </DsItem>
      </DsGrid>

      <DsItem
        name="Validation and the error summary"
        spec="role=alert · aria-describedby · focus moves to the summary"
        usage="Long forms get a summary at the top listing every problem as a link to the field. Submitting an invalid form moves focus to the summary rather than silently doing nothing."
        wide
      >
        <div className="w-full max-w-2xl">
          <Callout tone="danger" role="alert" icon="alert" title="Two details need fixing">
            <ul className="mt-1 flex flex-col gap-1">
              <li>
                <a className="font-semibold underline underline-offset-2" href="#ds-demo-card">
                  Card number is not 16 digits
                </a>
              </li>
              <li>
                <a className="font-semibold underline underline-offset-2" href="#ds-demo-card">
                  Expiry date is in the past
                </a>
              </li>
            </ul>
          </Callout>
          <div className="mt-3">
            <TextField
              id="ds-demo-card"
              label="Card number"
              required
              iconStart="card"
              defaultValue="4111 1111 11"
              error="Card number is not 16 digits"
            />
          </div>
        </div>
      </DsItem>
    </DsSection>
  );
}

/* ================================================================== */
/* Surfaces and cards                                                  */
/* ================================================================== */

export function SurfaceSection() {
  const product = PRODUCTS[0];
  const soldOut =
    PRODUCTS.find((p) => Object.values(p.availability).some((a) => a === "sold_out")) ?? PRODUCTS[1];

  return (
    <DsSection
      id="surfaces"
      number="10"
      title="Cards and surfaces"
      lead="Panels are white on cream with a warm hairline. Product cards come in a grid form for browsing and a row form for upsells and search results, and both carry availability, promotion and spice information without a hover."
    >
      <DsGrid cols={2}>
        <DsItem name="Product card · grid" spec="ProductCard · 4:3 image · quick add" usage="The default menu card. Quick add skips the detail page when a dish has no required options.">
          <div className="w-full max-w-[280px]">
            <ProductCard product={product} />
          </div>
        </DsItem>

        <DsItem name="Product card · sold out" spec="Disabled add, availability chip, alternative prompt" usage="A sold-out dish stays visible so the menu does not shift, but the action changes to browsing something similar.">
          <div className="w-full max-w-[280px]">
            <ProductCard product={soldOut} />
          </div>
        </DsItem>

        <DsItem name="Panel, stats and key values" spec="Panel · Stat · KeyValue · IconStat" usage="Stats head admin screens. Key-value lists carry receipt and order metadata, with monospaced figures where alignment matters.">
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Stat value="128" label="Orders today" sub="+18% on yesterday" tone="success" icon="bag" />
            <Stat value={money(486050)} label="Revenue today" sub="Both branches" icon="chart" />
            <Panel className="p-3 sm:col-span-2">
              <dl>
                <KeyValue k="Order code" v="BGG-2411-0038" mono />
                <KeyValue k="Branch" v="SS15 Subang Jaya" />
                <KeyValue k="Payment" v="Visa ending 4821 · Maybank" mono />
              </dl>
            </Panel>
            <div className="sm:col-span-2">
              <IconStat icon="clock" label="Average preparation" value="18 minutes" />
            </div>
          </div>
        </DsItem>

        <DsItem name="Callouts" spec="Callout · neutral, info, success, warning, danger" usage="Callouts explain a rule or a consequence. Anything the customer must act on gets role=alert so it is announced.">
          <div className="flex w-full flex-col gap-2.5">
            <Callout tone="info" icon="sparkle" title="Nearest branch">
              Taylor&rsquo;s Lakeside is 1.2km away and open until 22:00.
            </Callout>
            <Callout tone="warning" icon="alert" title="This branch is closing soon">
              SS15 stops accepting delivery orders at 21:30.
            </Callout>
            <Callout tone="danger" icon="cross" title="Payment declined" role="alert">
              Nothing was charged. Your order is still open.
            </Callout>
          </div>
        </DsItem>
      </DsGrid>

      <DsGrid cols={2}>
        <DsItem name="Map and QR" spec="MapView · QRCode — both decorative placeholders" usage="The map is an illustrated stand-in with real pin semantics for branch, rider and customer. The QR renders a deterministic pattern and is never a scannable payment code in this prototype.">
          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto]">
            <MapView
              label="Route from SS15 Subang Jaya to Jalan SS15/4"
              className="h-40"
              route
              pins={[
                { x: 22, y: 30, tone: "branch", name: "SS15 branch" },
                { x: 55, y: 55, tone: "rider", name: "Rider Hafiz" },
                { x: 82, y: 74, tone: "customer", name: "Your address" },
              ]}
            />
            <div className="flex justify-center">
              <QRCode seed="BGG-2411-0038" size={132} />
            </div>
          </div>
        </DsItem>

        <DsItem name="Totals block" spec="TotalsBlock · subtotal, discount, fee, SST, total" usage="One component for the cart, checkout, payment summary, confirmation and receipt, so a customer never sees the same order add up two different ways.">
          <div className="w-full max-w-sm">
            <TotalsBlock
              subtotal={4590}
              discount={500}
              deliveryFee={599}
              tax={275}
              total={4964}
              promotionLabel="BANGGA5 · RM5 off"
              fulfilment="delivery"
            />
          </div>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Overlays                                                            */
/* ================================================================== */

export function OverlaySection() {
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sheetIos, setSheetIos] = useState(false);
  const [sheetAndroid, setSheetAndroid] = useState(false);
  const { pushToast } = useStore();

  return (
    <DsSection
      id="overlays"
      number="11"
      title="Overlays and feedback"
      lead="Four overlay types, each with a job. All of them trap focus, close on Escape, restore focus to the trigger, and lock the page behind them."
    >
      <DsItem
        name="Open each overlay"
        spec="Dialog · ConfirmDialog · Drawer · BottomSheet · Toast"
        usage="Dialogs are for a decision. Drawers are for admin detail beside a list. Bottom sheets are the phone equivalent and follow the platform's own shape. Toasts confirm something that already happened and never carry the only route to undo."
        wide
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDialog(true)}>
            Dialog
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(true)}>
            Confirm dialog
          </Button>
          <Button variant="secondary" onClick={() => setDrawer(true)}>
            Admin drawer
          </Button>
          <Button variant="secondary" onClick={() => setSheetIos(true)}>
            iOS sheet
          </Button>
          <Button variant="secondary" onClick={() => setSheetAndroid(true)}>
            Android sheet
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              pushToast({
                tone: "success",
                title: "Added to your cart",
                body: "Buldak fried chicken, medium spice",
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              pushToast({
                tone: "danger",
                title: "Could not apply that code",
                body: "BANGGA5 expired on 30 September",
              })
            }
          >
            Error toast
          </Button>
        </div>
      </DsItem>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Change branch?"
        description="Your cart was built from the SS15 menu."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(false)}>
              Keep SS15
            </Button>
            <Button variant="dark" onClick={() => setDialog(false)}>
              Switch to Taylor&rsquo;s
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-ink">
          Two items in your cart are not on the Taylor&rsquo;s Lakeside menu and will be removed.
          Everything else stays, and prices are the same at both branches.
        </p>
      </Dialog>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setConfirm(false)}
        destructive
        title="Reject this order?"
        confirmLabel="Reject and refund"
        cancelLabel="Go back"
        body={
          <p>
            {REJECTION_REASONS[0]} will be shown to the customer, and {money(4890)} is refunded to
            their Visa card automatically within three to five working days.
          </p>
        }
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="BGG-2411-0038"
        subtitle="SS15 Subang Jaya · placed 18:42"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawer(false)}>
              Close
            </Button>
            <Button variant="dark" iconStart="printer" onClick={() => setDrawer(false)}>
              Print kitchen ticket
            </Button>
          </>
        }
      >
        <dl>
          <KeyValue k="Customer" v="Nurul Aisyah" />
          <KeyValue k="Phone" v="+60 12 *** 6789" mono />
          <KeyValue k="Fulfilment" v="Delivery · Jalan SS15/4" />
          <KeyValue k="Payment" v="Visa ending 4821 · Maybank" mono />
          <KeyValue k="Total" v={money(4890)} mono />
        </dl>
        <Divider className="my-4" />
        <EventTimeline events={MOCK_ORDERS[0].events} />
      </Drawer>

      <BottomSheet
        open={sheetIos}
        onClose={() => setSheetIos(false)}
        title="Spice level"
        platform="ios"
        footer={
          <Button full size="lg" onClick={() => setSheetIos(false)}>
            Save choice
          </Button>
        }
      >
        <p className="text-[14px] text-grey">
          The iOS sheet has a grabber, rounded top corners and a cancel affordance at the bottom.
        </p>
      </BottomSheet>

      <BottomSheet
        open={sheetAndroid}
        onClose={() => setSheetAndroid(false)}
        title="Spice level"
        platform="android"
        footer={
          <Button full size="lg" onClick={() => setSheetAndroid(false)}>
            Save choice
          </Button>
        }
      >
        <p className="text-[14px] text-grey">
          The Android sheet uses Material corner radii, a drag handle and text buttons aligned to the
          trailing edge.
        </p>
      </BottomSheet>
    </DsSection>
  );
}

/* ================================================================== */
/* Data display                                                        */
/* ================================================================== */

export function DataSection() {
  const [page, setPage] = useState(1);
  const rows = MOCK_ORDERS.slice(0, 5);

  return (
    <DsSection
      id="data"
      number="12"
      title="Data display"
      lead="Admin tables are scannable first and pretty second: tabular figures, one row height, status in words and colour, and a caption that describes the table for anyone not looking at it."
    >
      <DsItem
        name="Data table"
        spec="DataTable · caption, scoped headers, row click, selected row"
        usage="Row click opens a drawer rather than navigating away, so staff keep their filters. Sorting and bulk selection live in the toolbar above."
        wide
      >
        <div className="w-full">
          <DataTable
            caption="Five most recent orders across both branches"
            rows={rows}
            columns={[
              { key: "code", header: "Order", render: (o) => <span className="num">{o.code}</span> },
              { key: "customer", header: "Customer", render: (o) => o.customerName },
              {
                key: "status",
                header: "Status",
                render: (o) => <StatusBadge status={o.status} audience="admin" soft />,
              },
              {
                key: "payment",
                header: "Payment",
                render: (o) => <PaymentBadge status={o.payment.status} />,
              },
              {
                key: "total",
                header: "Total",
                align: "right",
                render: (o) => <span className="num font-semibold">{money(o.total)}</span>,
              },
            ]}
          />
          <div className="mt-3">
            <Pagination page={page} pages={9} total={128} onPage={setPage} />
          </div>
        </div>
      </DsItem>

      <DsGrid cols={2}>
        <DsItem name="Event timeline" spec="EventTimeline · status, time, actor" usage="Every transition is recorded with who caused it: the customer, branch staff, the payment provider or the system.">
          <div className="w-full">
            <EventTimeline events={MOCK_ORDERS[0].events} />
          </div>
        </DsItem>

        <DsItem name="Loading skeletons" spec="Skeleton · SkeletonCard · SkeletonRow" usage="Skeletons match the shape of the content they replace, so nothing reflows when data lands. Tables keep their header and swap only the rows.">
          <div className="grid w-full grid-cols-2 gap-3">
            <SkeletonCard />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          </div>
        </DsItem>
      </DsGrid>

      <DsGrid cols={2}>
        <DsItem name="Empty state" spec="EmptyState · icon, title, body, action" usage="Every empty state says what happened, why, and offers the one action that fixes it.">
          <div className="w-full">
            <EmptyState
              icon="cart"
              title="Your cart is empty"
              body="Add something from the menu and it will show up here."
              action={<Button iconEnd="arrowRight">Browse the menu</Button>}
            />
          </div>
        </DsItem>

        <DsItem name="Error state" spec="ErrorState · request id, retry" usage="A request id gives support something to search for. Retry is always available and never the only option.">
          <div className="w-full">
            <ErrorState
              title="We could not load the menu"
              body="The connection dropped while we were fetching today's dishes. Nothing in your cart was lost."
              requestId="REQ-8F31-2C90"
              onRetry={() => {}}
            />
          </div>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Payment states                                                      */
/* ================================================================== */

export function PaymentStatesSection() {
  return (
    <DsSection
      id="payment"
      number="13"
      title="Payment states"
      lead={
        <>
          Two methods, two providers, sixteen states between them. The wording is fixed, because a
          customer who is unsure whether they have been charged will not try again. They will call
          the branch.
        </>
      }
    >
      <TokenTable
        caption="Every payment state in the prototype and the exact promise made to the customer"
        head={["State", "Method", "Provider", "What the customer is told"]}
        rows={[
          ["Method selection", "Both", "\u2014", "Two ways to pay, both secure. Nothing is charged until you confirm."],
          ["Card entry", "Visa", "Maybank", "Payment processed securely by Maybank"],
          ["Card validation error", "Visa", "Maybank", "Field-level errors, with an error summary above the form"],
          ["Processing", "Visa", "Maybank", "Full-screen hold with the amount and order code, no way to submit twice"],
          ["Declined", "Visa", "Maybank", "Bank reason code, nothing charged, retry uses the same order"],
          ["Duplicate prevented", "Both", "Both", "A payment for this order is already in progress \u2014 we will never charge you twice"],
          ["Confirmation delayed", "Both", "Both", "Payment went through, confirmation is slow, do not pay again, we keep checking"],
          ["Success", "Both", "Both", "Amount, method, provider reference, then straight to the branch"],
          ["QR generating", "DuitNow", "OXPay", "Building your code"],
          ["QR live", "DuitNow", "OXPay", "Ten-minute countdown, amount, reference, save and open-app actions"],
          ["QR not yet paid", "DuitNow", "OXPay", "No payment received yet \u2014 keep the code open, this page updates on its own"],
          ["QR expired", "DuitNow", "OXPay", "Code expired, generate a new one, nothing charged"],
          ["Waiting for branch", "Both", "Both", "Paid, now waiting for the branch to accept within the response window"],
          ["Branch rejected", "Both", "Both", "Reason shown, refund started automatically"],
          ["Branch timed out", "Both", "Both", "No response, order cancelled, refund started automatically"],
          ["Refunded", "Both", "Both", "Amount back to the original method in three to five working days, with a reference"],
        ]}
      />

      <DsGrid cols={2}>
        <DsItem name="Method choice" spec="Exact production copy" usage="Provider names are shown because Malaysian customers recognise Maybank and DuitNow far more readily than they recognise our brand as a payment processor.">
          <div className="flex w-full flex-col gap-2.5">
            <Panel className="p-3.5">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Badge tone="neutral" soft icon="card">
                  Card
                </Badge>
                Pay securely with Visa
              </p>
              <p className="mt-1 text-[13px] text-grey">Payment processed securely by Maybank</p>
            </Panel>
            <Panel className="p-3.5">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Badge tone="neutral" soft icon="qr">
                  QR
                </Badge>
                Scan and pay with DuitNow QR
              </p>
              <p className="mt-1 text-[13px] text-grey">DuitNow QR powered by OXPay</p>
            </Panel>
          </div>
        </DsItem>

        <DsItem name="The rules we always state" spec="Cancellation · contact · refund" usage="These three sentences appear in the cart, at checkout, on the confirmation screen and on the receipt, in the same words each time.">
          <ul className="flex w-full flex-col gap-2.5">
            <li className="flex gap-2 text-[14px] leading-snug text-ink">
              <Badge tone="info" soft>
                1
              </Badge>
              You can cancel free of charge at any point before you pay.
            </li>
            <li className="flex gap-2 text-[14px] leading-snug text-ink">
              <Badge tone="info" soft>
                2
              </Badge>
              Once the branch has confirmed your order, please contact the branch directly to
              change anything.
            </li>
            <li className="flex gap-2 text-[14px] leading-snug text-ink">
              <Badge tone="info" soft>
                3
              </Badge>
              If the branch rejects your order or does not respond in time, your payment is refunded
              automatically.
            </li>
          </ul>
        </DsItem>
      </DsGrid>
    </DsSection>
  );
}

/* ================================================================== */
/* Accessibility                                                       */
/* ================================================================== */

export function AccessibilitySection() {
  return (
    <DsSection
      id="a11y"
      number="14"
      title="Accessibility"
      lead="Targeting WCAG 2.2 AA across all four platforms. These are the specific commitments this prototype makes, and where each one is demonstrated."
    >
      <TokenTable
        caption="WCAG 2.2 AA commitments and where they are implemented"
        head={["Requirement", "How this system meets it", "See it on"]}
        rows={[
          [
            "Contrast 4.5:1 for text",
            "Body text is dark ink on cream or white, measuring above 12:1. Teal and coral are barred from small text and the colour section computes every ratio live.",
            "Colour section above",
          ],
          [
            "Not colour alone",
            "Every status carries an icon and a word alongside its colour.",
            "Status system, order tracker",
          ],
          [
            "Visible focus",
            "A two-pixel deep-teal ring with a two-pixel offset on every focusable element, never removed.",
            "Tab through any screen",
          ],
          [
            "Target size 24px minimum",
            "Everything interactive is at least 44px tall, clearing both platform guidance and the standard.",
            "Grid and frames section",
          ],
          [
            "Labels and instructions",
            "Visible labels on every field, hints before the error, and required stated in words.",
            "Forms section",
          ],
          [
            "Error identification and suggestion",
            "Errors are announced, tied to the field with aria-describedby, and long forms add a summary that receives focus.",
            "Validation demo, payment screen",
          ],
          [
            "Status messages",
            "Countdowns, polling updates and payment outcomes are wrapped in aria-live regions rather than being announced as page changes.",
            "Payment and confirmation screens",
          ],
          [
            "Keyboard operable",
            "No drag-only interaction. The kitchen board, reorderable categories and the food rail all have button equivalents.",
            "Kitchen board, food rail",
          ],
          [
            "Focus management in overlays",
            "Dialogs, drawers and sheets trap focus, close on Escape and return focus to the trigger.",
            "Overlays section",
          ],
          [
            "Reduced motion",
            "prefers-reduced-motion and an in-prototype switch both collapse movement to a short fade and freeze the 2.5D scenes.",
            "Prototype panel, homepage",
          ],
          [
            "Semantic structure",
            "One h1 per screen, ordered headings, landmark regions, ordered lists for timelines and captions on every table.",
            "Every screen",
          ],
          [
            "Skip link",
            "The first focusable element on every layout jumps to main content.",
            "Press Tab now",
          ],
        ]}
      />

      <DsItem name="Focus ring" spec="2px solid deep teal · 2px offset · never removed" usage="Tab into these controls to see the ring. It is defined once globally on :focus-visible so no component can opt out." wide>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary">Focus me</Button>
          <Chip onClick={() => {}}>And me</Chip>
          <a href="#a11y" className="text-[14px] font-semibold text-ink underline underline-offset-4">
            Links too
          </a>
          <input
            aria-label="Focus demonstration field"
            className="h-11 rounded-[12px] border border-line px-3 text-[14px]"
            placeholder="And fields"
          />
        </div>
      </DsItem>

      <DsItem name="Screen reader wording" spec="aria-label vs visible label" usage="Decorative Korean characters and illustrations are aria-hidden. Icon-only buttons always carry a label that says what will happen, not what the icon looks like." wide>
        <div className="grid w-full gap-3 md:grid-cols-2">
          <div className="rounded-[12px] border border-deep/25 bg-mint p-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-deep">Announced</p>
            <p className="num mt-1 text-[13px] text-ink">
              &ldquo;Add Buldak fried chicken to cart, button&rdquo;
            </p>
          </div>
          <div className="rounded-[12px] border border-cta/30 bg-cta/8 p-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-cta-dark">Never</p>
            <p className="num mt-1 text-[13px] text-ink">&ldquo;plus icon, button&rdquo;</p>
          </div>
        </div>
      </DsItem>
    </DsSection>
  );
}
