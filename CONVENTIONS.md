# Prototype build conventions — read before editing

This is a **UI-only** high-fidelity prototype. Next.js 16 App Router, React 19,
TypeScript, Tailwind CSS v4. There is **no backend, no Supabase, no auth service,
no real Maybank / OXPay / Lalamove integration and no webhooks**. Every
interaction is driven by typed mock data and simulated state.

Never add: API routes that do real work, secret keys, database clients, or any
network call. Never install new npm packages.

---

## Paths

```
src/lib/tokens.ts       design tokens (source of truth, mirrored in globals.css)
src/lib/types.ts        domain types
src/lib/mock-data.ts    BRANCHES, CATEGORIES, PRODUCTS, OPTION_GROUPS, PROMOTIONS,
                        SAVED_ADDRESSES, MOCK_ORDERS, CUSTOMERS, ADMIN_USERS,
                        AUDIT_LOG, DASHBOARD, MOCK_USER, PROTOTYPE_RULES
src/lib/format.ts       money(), moneyLabel(), cn(), branchStatus(), todayHours(),
                        etaRange(), recommendBranch(), countdown(), dayName(), SST_RATE
src/lib/status.ts       ORDER_STATUS, PAYMENT_STATUS, AVAILABILITY, TRANSITIONS,
                        REJECTION_REASONS, DELIVERY_STEPS, PICKUP_STEPS, canCustomerCancel()
src/lib/store.tsx       useStore() — cart, branch, checkout draft, orders, sim flags, toasts
src/components/ui/*     icons, primitives, forms, overlays, data, media
src/components/site/*   header, footer, branch-switcher, product-card, branch-card,
                        reveal, food-rail
```

Import with the `@/` alias. Money is **integer sen** everywhere; render with
`money()` and the `num` class (tabular numerals).

---

## Component API (do not re-invent these)

`@/components/ui/primitives`
- `Button` — `variant: primary | secondary | ghost | destructive | dark`, `size: sm|md|lg`,
  `iconStart/iconEnd` (IconKey), `loading`, `full`
- `ButtonLink` — same props plus `href`
- `Badge` — `tone: neutral|info|success|warning|danger`, `icon`, `soft`
- `StatusBadge` — `status: OrderStatus`, `audience: "customer" | "admin"`
- `PaymentBadge`, `AvailabilityChip`, `PromoBadge`, `BranchOpenBadge`
- `Price` — `sen`, optional `original`, `size`
- `Panel`, `SectionTitle`, `Divider`, `Callout`, `Stat`, `KeyValue`
- `Skeleton`, `SkeletonCard`, `SkeletonRow`, `EmptyState`, `ErrorState`

`@/components/ui/forms` (client)
- `TextField`, `TextAreaField`, `SelectField`, `ChoiceRow`, `Segmented`, `Chip`,
  `QuantityStepper`, `Toggle`

`@/components/ui/overlays` (client)
- `Dialog`, `ConfirmDialog`, `Drawer`, `BottomSheet`, `ToastHost` (already mounted globally)

`@/components/ui/data` (client)
- `DataTable<T>` (`columns: Column<T>[]`, `rows`, `onRowClick`, `selectedId`, `caption`),
  `Pagination`, `OrderTracker`, `EventTimeline`, `BarChart`, `TotalsBlock`,
  `OrderLinesList`, `IconStat`

`@/components/ui/media`
- `FoodImage` (`src`, `alt`, `variant: dish|scene|portrait`) — renders a designed
  placeholder until real photography exists. Always pass a real descriptive `alt`.
- `PhotoStrip`, `MapView`, `QRCode`, `Avatar`

`@/components/ui/icons`
- `Icon` with `name: IconKey`. Available keys are the object keys of `Icons` in
  `src/components/ui/icons.tsx`. Add new icons there rather than inlining SVG.

---

## Colours and type

Tailwind classes from the `@theme` block: `teal deep ink cream coral cta cta-dark
yellow mint grey line line-dark`. Use `bg-cream` pages, `bg-white` cards,
`bg-cta` only for primary actions, `bg-ink`/`bg-deep` for dark sections,
`yellow` for promotion badges.

Accessibility rules that are non-negotiable:
- Never small white text on `#6EC7CE` (`teal`) — use `text-ink`.
- White text only on `deep`, `ink` or `cta`.
- Status always carries an icon **and** a text label. Never colour alone.
- Every interactive element is keyboard reachable with a visible focus ring
  (handled globally by `:focus-visible`).
- Minimum touch target 44px; inputs are 16px font minimum.
- Headings are hierarchical, one `h1` per page, images have real alt text.

Headings use Poppins automatically (`h1–h4` in `globals.css`). Body is Inter.

---

## Simulation flags

`useStore().sim` drives every simulated outcome. Respect these:

| Flag | Values | Meaning |
|---|---|---|
| `cardOutcome` | `success` `declined` `delayed` `duplicate` | Visa card result |
| `qrOutcome` | `success` `expire` `delayed` | DuitNow QR result |
| `branchResponse` | `accept` `reject` `timeout` | Branch confirmation result |
| `riderOutcome` | `normal` `no_rider` | Lalamove booking result |
| `refundMode` | `auto` `manual` | Whether an automatic reversal is possible |
| `fastForward` | boolean | Compress timers (5 min → ~20s, QR 10 min → ~30s) |
| `offline` | boolean | Show offline banner, disable network-dependent actions |
| `signedIn` | boolean | Guest vs authenticated path |
| `reducedMotion` | boolean | Already wired to `<html data-reduced-motion>` |

Timers: when `fastForward` is on, use a 15× multiplier so a reviewer can watch
the whole flow. Always show the real rule in the copy ("5 minutes"), and label it
as a prototype business rule.

---

## Payment rules (important)

The customer sees exactly **two** payment choices:
1. **Visa Card** — "Pay securely with Visa", provider line "Payment processed
   securely by Maybank" (provider name visually secondary, small, grey).
2. **DuitNow Dynamic QR** — "Scan and pay with DuitNow QR", provider line
   "DuitNow QR powered by OXPay".

Maybank is never presented as a third method. Card fields are number, cardholder
name, expiry, CVV plus a secure-payment message. No real card data handling —
values live in component state only.

Required payment UI states: method selection, card form, card validation error,
card processing, card declined, payment successful, QR generated, QR countdown,
waiting for payment, QR expired, generate new QR, confirmation delayed,
duplicate payment prevented, paid but waiting for branch, refund pending,
refund completed, manual refund required.

## Order rules (must be visible in the UI)

- Cancel is allowed **only** before payment completes (`canCustomerCancel()`).
- After branch confirmation show exactly:
  “This order is already being prepared. Please contact the branch for assistance.”
- Branch rejection shows refund initiated with a reference.
- No branch response within 5 minutes → automatic rejection → refund pending.
- Label the 5-minute rule as a prototype business rule
  (`PROTOTYPE_RULES.branchSlaLabel`).
- Refund completion time depends on the provider and bank
  (`PROTOTYPE_RULES.refundTimingLabel`).

---

## Every screen needs

Loading (skeletons matching the real layout), empty, error (with a retry and a
reference id), and offline behaviour where network matters. No full-page
blocking spinners.

---

## Verification

Run `npx tsc --noEmit --incremental false` when you finish. Do **not** run
`next build` or `next dev` — the top-level agent does that at the end.
