# Component Inventory & Development-Ready Specifications

Behavioural and structural specs. Final colour, type and imagery treatment is
applied in Phase 2 — the contracts below will not change when styling lands.

Three packages: `packages/tokens` (platform-agnostic), `packages/ui-web`
(React DOM, used by web + admin), `packages/ui-native` (React Native, used by
mobile). Component names and prop names are identical across web and native
wherever the concept is the same.

---

## 1. Tokens (`packages/tokens`)

Exported as TypeScript constants, consumed by Tailwind (web/admin) via a preset
and by a native theme provider (mobile). One source, three outputs.

```ts
export const color = {
  brand:   { primary: "#6EC7CE", deepTeal: "#1D5960" },
  ink:     "#102A2E",
  cream:   "#FFF7E8",
  coral:   { soft: "#CE756E", cta: "#B9433B" },
  yellow:  "#F4C95D",
  mint:    "#DDF3EF",
  white:   "#FFFFFF",
  grey:    "#66777A",
  status: {
    success: "#1D5960", warning: "#F4C95D",
    danger:  "#B9433B", info:    "#6EC7CE", neutral: "#66777A",
  },
} as const;

export const space  = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;
export const radius = { sm: 8, md: 16, lg: 24, pill: 999 } as const;
export const motion = {
  duration: { instant: 100, fast: 160, base: 240, slow: 400, story: 800 },
  easing:   { standard: [0.2, 0, 0, 1], entrance: [0, 0, 0, 1], exit: [0.3, 0, 1, 1] },
  reducedMotion: "opacity-only",
} as const;
```

Tokens carry no component semantics — `color.coral.cta` is a colour, `Button`
decides it is the primary action background.

---

## 2. Component inventory

Status: **P1** = needed for the 12 priority screens · **P2** = needed for launch.

### Actions

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `Button` | `variant: primary \| secondary \| ghost \| destructive`, `size: sm \| md \| lg`, `loading`, `disabled`, `iconStart/End`, `fullWidth` | Coral CTA for primary, teal outline for secondary. Loading keeps the label and width, swaps the icon for a spinner, and sets `aria-busy`. Disabled always pairs with a visible reason nearby. Min target 44×44. | P1 |
| `IconButton` | `icon`, `label` (required), `variant`, `size` | `label` is mandatory and becomes `aria-label`. | P1 |
| `LinkButton` | `href`, `variant`, `external` | Renders `<a>`/`Pressable` — anything that navigates is a link, not a button. | P1 |
| `QuantityStepper` | `value`, `min`, `max`, `onChange`, `size` | Decrement at `min` becomes Remove with confirmation. Debounced (300ms) network sync with optimistic UI. Long-press repeat on native. | P1 |
| `SegmentedControl` | `options`, `value`, `onChange` | Pickup/Delivery, Active/History. Arrow-key navigable, roving tabindex. | P1 |

### Content display

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `FoodCard` | `product`, `layout: grid \| row \| compact`, `availability`, `promotion`, `onAdd` | Whole card navigates to detail; `onAdd` stops propagation. `row` is the mobile default. Image lazy-loads with a blur placeholder and a fixed aspect ratio so the grid never shifts. Sold out dims the media, shows a text chip and disables Add. | P1 |
| `CategoryTabs` | `categories`, `active`, `onChange`, `sticky` | Scroll-spy sync, active chip auto-scrolls into view, horizontal scroll with edge fades and keyboard support. | P1 |
| `PromotionBadge` | `type`, `label`, `size` | Yellow fill with ink text. Always carries a text label — never a bare colour dot. | P1 |
| `PriceLabel` | `cents`, `originalCents`, `size`, `currency` | Tabular numerals, `RM` prefix, two decimals. Strikethrough original with an accessible "was RM X, now RM Y" label. | P1 |
| `AvailabilityChip` | `state: available \| low \| sold_out`, `branchName` | Icon + text, never colour alone. "Sold out at SS15". | P1 |
| `BranchCard` | `branch`, `variant: marketing \| selector`, `distanceKm`, `onSelect` | Shows open/closed computed live, hours, phone, fulfilment chips, map, directions. | P1 |
| `PhotoStrip` | `images`, `animated` | Photo booth motif. Static when reduced motion is on. | P2 |
| `Stat` / `KpiTile` | `value`, `label`, `delta`, `tone` | Admin dashboard. Delta shows an arrow glyph plus a sign, not only colour. | P1 |

### Forms

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `TextField` | `label`, `hint`, `error`, `required`, `prefix/suffix`, `maxLength` | Persistent visible label (never placeholder-only). Error is text + icon, linked by `aria-describedby`, announced politely. 16px minimum font on mobile. | P1 |
| `TextArea` | + `showCount` | Customer notes; live character count. | P1 |
| `Select` / `Dropdown` | `options`, `value`, `searchable`, `onChange` | Native picker on mobile, listbox on web, full keyboard support, type-ahead. | P1 |
| `RadioGroup` / `CheckboxGroup` | `options`, `min`, `max`, `required` | Powers option groups. Enforces min/max with an inline message rather than a silent block, and shows price deltas in the option row. | P1 |
| `AddressField` | `value`, `onChange`, `onGeocode` | Autocomplete + map pin adjust + manual entry fallback. Manual entry is always reachable — never gated behind a permission. | P1 |
| `PhoneField` | `value`, `country` | Defaults to +60, validates Malaysian mobile formats. | P1 |
| `VoucherInput` | `onApply`, `applied` | Inline apply, inline failure reason, removable chip when applied. | P1 |
| `PaymentMethodSelector` | `methods`, `value`, `onChange` | Card and DuitNow QR as expandable rows; the selected method's fields render inline. | P1 |
| `QRDisplay` | `payload`, `expiresAt`, `onRegenerate`, `status` | Minimum 240×240 render, countdown, live polling status line, regenerate on expiry, save-to-photos on native. | P1 |

### Cart & order

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `CartLineItem` | `item`, `editable`, `unavailable` | Thumbnail, name, chosen options, notes, stepper, line total. Unavailable shows a reason and a resolve action. Swipe-to-remove with undo on mobile. | P1 |
| `OrderSummary` | `totals`, `collapsible`, `quoteExpiresAt` | Subtotal, discount, delivery, tax, total. Sticky on desktop, expandable bottom bar on mobile. Surfaces the quote countdown when present. | P1 |
| `OrderStatusTracker` | `status`, `history`, `fulfilmentType`, `orientation` | Maps 15 backend statuses to 5 (delivery) or 4 (pickup) visible steps with timestamps. Horizontal on desktop, vertical on mobile. Announces changes via `aria-live="polite"`. | P1 |
| `PaymentStatusBadge` / `DeliveryStatusBadge` / `BranchStatusBadge` | `status` | Icon + text + shape variation. Shared status vocabulary across all three surfaces. | P1 |
| `RiderCard` | `rider`, `onCall`, `onMessage` | Name, vehicle, plate, contact actions. | P1 |
| `ReceiptView` | `order`, `downloadable` | Print stylesheet on web, share sheet on native. | P2 |

### Feedback & system

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `NotificationBanner` | `tone`, `title`, `action`, `dismissible` | Page-level; `role="status"` for info, `role="alert"` for errors. | P1 |
| `Toast` | `tone`, `message`, `action`, `duration` | Add-to-cart and undo. Minimum 5s when it carries an action; never the only channel for critical information. | P1 |
| `ConfirmDialog` | `title`, `body`, `confirmLabel`, `destructive`, `requireReason` | Focus trapped, Escape closes, focus returns to the trigger. Destructive variants name the consequence in the button ("Reject order"), never "OK". | P1 |
| `EmptyState` | `illustration`, `title`, `body`, `action` | Always offers the next action. | P1 |
| `Skeleton` | `variant`, `count` | Matches the real layout's dimensions to avoid layout shift. Static under reduced motion. | P1 |
| `ErrorState` | `code`, `message`, `requestId`, `onRetry` | Shows a plain-language message plus the request ID for support. | P1 |
| `OfflineBanner` | `queuedCount`, `onRetry` | Persistent while offline; reports queued actions. | P1 |

### Admin-only

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `DataTable` | `columns`, `rows`, `sort`, `selection`, `density`, `stickyHeader`, `rowActions` | Virtualised beyond 100 rows, column sorting, sticky header, keyboard row navigation, and realtime row-change highlighting. | P1 |
| `Pagination` | `page`, `pageSize`, `total` | Page size 25/50/100; state reflected in the URL so views are shareable. | P1 |
| `FilterBar` | `filters`, `value`, `onChange`, `onClear` | Date range, status, type, payment, branch. Active filters render as removable chips with a result count. URL-synced. | P1 |
| `DetailDrawer` | `open`, `width`, `onClose` | Right-side overlay, focus trapped, deep-linkable, keeps the list mounted behind it. | P1 |
| `StatusSelect` | `current`, `allowed`, `onChange` | Offers only legal transitions from the state machine; anything illegal is absent, not disabled-and-mysterious. | P1 |
| `AlertPanel` | `alerts` | Dashboard "needs attention" list, ordered by urgency, each row linking to its resolution screen. | P1 |
| `AuditTrail` | `entries` | Actor, action, before/after diff, timestamp. | P2 |

### Navigation & layout

| Component | Props | Behaviour | Pri |
|---|---|---|---|
| `SiteHeader` | `variant: marketing \| ordering`, `cartCount`, `branch` | Condenses on scroll; one primary CTA. | P1 |
| `MobileBottomNav` | `items`, `active` | Web ordering routes + native tabs. Safe-area aware. | P1 |
| `FloatingCartPill` | `count`, `total`, `onPress` | Appears above the tab bar when the cart is non-empty. | P1 |
| `BranchSelector` | `branches`, `value`, `onChange`, `showDistance` | Shared by header chip, checkout and admin scope. Warns before switching when the cart has items. | P1 |
| `AdminSidebar` | `sections`, `collapsed`, `badges` | Grouped nav with live count badges. | P1 |
| `StepIndicator` | `steps`, `current` | Checkout progress; completed steps are navigable backwards. | P1 |
| `SectionShell` | `pace: story \| fast`, `background` | Homepage section wrapper that decides motion budget from `pace`. | P1 |

### 3D / motion (web only, marketing routes only)

| Component | Behaviour | Pri |
|---|---|---|
| `Scene3D` | Lazy `next/dynamic` R3F canvas with `ssr: false`, IntersectionObserver mount, `frameloop="demand"` when idle, poster fallback, automatic teardown on unmount. | P2 |
| `HeroFoodScene` | Pointer parallax + scroll-linked rotation. Never blocks the hero CTAs. | P2 |
| `PhotoBoothScene` | Floating strips, curtain reveal, soft flash. No effect above 3 Hz; reduced-motion renders a static composition. | P2 |
| `ScrollReveal` | GSAP ScrollTrigger wrapper; degrades to an opacity fade under reduced motion and renders content immediately if JS fails. | P1 |

---

## 3. Shared logic (`packages/core`)

Not UI, but every client depends on it and it must be written once:

- `OrderStatus` enum and `canTransition(from, to, actor)` — mirrored by a database trigger.
- `calculateCartTotals(items, promotion, deliveryFee, taxRate)` — integer cents, banker-safe rounding, shared by client preview and server authority.
- `isBranchOpen(branch, hours, closures, now)` in Asia/Kuala_Lumpur.
- `findEligibleBranches(point, branches)` — haversine distance and radius.
- `validateOptionSelection(group, selected)` — min/max/required.
- `formatMYR(cents)`, `formatOrderCode(id)`, `formatEta(minutes)`.
- Customer-facing status copy map, so web, mobile and email never drift.

---

## 4. Definition of "development-ready"

A component is ready to build when it has: a typed prop contract, every visual
state enumerated (default, hover, active, focus-visible, disabled, loading,
error, empty), responsive behaviour at all defined breakpoints, accessibility
notes (role, label, keyboard, announcement), motion spec with a reduced-motion
alternative, and a usage rule stating when *not* to use it.

Tests required before merge: rendering of all states, keyboard operation,
`axe-core` with zero violations, and a visual regression snapshot per breakpoint.
