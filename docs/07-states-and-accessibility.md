# Loading, Empty, Error & Offline States · Accessibility · Responsive Behaviour

---

## 1. State model

Every data-driven screen has six possible states. A screen is not finished until
all six are designed.

```
idle → loading → success
              ↘ empty
              ↘ error
              ↘ offline
              ↘ unauthorised
```

### Loading

Skeletons, not spinners, wherever the final layout is predictable — a skeleton
that matches the real dimensions prevents layout shift and reads as faster. A
spinner is acceptable only for indeterminate, short, non-layout operations
(payment processing, applying a voucher).

| Screen | Loading treatment |
|---|---|
| Homepage | Static content renders immediately; 3D shows its poster; featured menu shows 4 skeleton cards |
| Menu | Category rail renders from cache; 6–9 skeleton cards per section |
| Food detail | Skeleton image + title + option rows; CTA disabled with "Loading options" |
| Cart | Line skeletons; summary values skeleton; checkout disabled |
| Checkout | Address list skeleton; delivery fee shows "Calculating…" not RM0.00 |
| Payment | Full-screen processing state with explicit "do not close" copy |
| Branch confirmation | Countdown starts immediately; the spinner is secondary |
| Tracking | Map skeleton; timeline renders from the last known status |
| Admin dashboard | KPI tiles and table rows as skeletons; sidebar renders instantly |
| Admin orders | Table skeleton rows; filters stay interactive |

Rule: no full-page blocking spinner anywhere in the product. Parts of a page that
have data show it.

### Empty

Every empty state names the situation, explains it in one line, and offers an
action. No dead ends.

| Context | Title | Action |
|---|---|---|
| Cart | "Your cart is empty" | Browse the menu |
| Search | "No results for 'kimchi fries'" | Clear search · popular items |
| Category at branch | "Nothing in this category at SS15 today" | Switch branch · see all |
| Order history | "No orders yet" | Explore the menu |
| Saved addresses | "No saved addresses" | Add an address |
| Vouchers | "No vouchers right now" | See promotions |
| Notifications | "You're all caught up" | — |
| Admin orders, filtered | "No orders match these filters" | Clear filters |
| Admin confirmation queue | "Nothing waiting" | — (positive, not an error) |

### Error

Errors are classified, and the classification decides the UI:

| Class | Example | Treatment |
|---|---|---|
| Recoverable, local | Menu fetch failed | Inline section with Retry; the rest of the page still works |
| Recoverable, global | API unreachable | Page-level banner with Retry |
| Validation | Missing required option | Inline at the field, focus moves to it, announced |
| Conflict | Item sold out at checkout | Blocking dialog with a resolution choice |
| Payment | Card declined | Reason + Retry on the **same** order, never a new one |
| Authorisation | Staff lacks permission | Explanatory label replacing the action, not a silent no-op |
| Fatal | Unhandled exception | Error boundary with a friendly page, request ID, home link |

Error copy is a plain sentence about what happened and what to do, never a raw
code or stack. The request ID is always shown in small text so support can trace
it. Errors are never dismissed automatically.

### Offline

| Surface | Behaviour |
|---|---|
| Web | Service worker caches the shell, last-viewed menu and cart; persistent offline banner; network-dependent actions disabled with an explanation; `/offline` fallback route |
| Mobile | Cached menu and cart in local storage; mutations queue and replay on reconnect; offline banner with queued count; **payment always requires connectivity and says so** |
| Admin | Realtime disconnection shows "Reconnecting — data may be delayed" with a manual refresh; actions taken while stale are validated server-side and conflicts are reported clearly |

On reconnect, data revalidates silently and the banner is replaced by a brief
"Back online" confirmation.

### Unauthorised / session expired

A session expiring mid-checkout must not destroy the cart. The user is prompted
to sign in again in place, and returns to the exact step with their data intact.
Guests are never forced into an account.

---

## 2. Accessibility

Target: WCAG 2.2 Level AA across web, admin and mobile.

### Colour and contrast

- Body text ≥ 4.5:1, large text (≥24px or ≥19px bold) ≥ 3:1, UI components and
  focus indicators ≥ 3:1.
- Never small white text on `#6EC7CE`; use `#102A2E`. White text only on
  `#1D5960` and `#102A2E`.
- Status is never colour alone. Every status pairs a colour with an icon **and**
  a text label — this is checked in review, and the design system makes the
  colour-only variant impossible to construct.
- The interface remains usable in greyscale; this is an explicit review step.

### Keyboard

- Every interactive element is reachable and operable by keyboard, in a logical
  DOM order.
- Visible focus: 2px indicator, 2px offset, ≥3:1 against its background. Never
  `outline: none` without a replacement.
- "Skip to main content" as the first tab stop on every page.
- Dialogs and drawers trap focus, close on Escape, and return focus to the
  trigger element.
- The menu category rail, option groups and segmented controls support arrow-key
  navigation with a roving tabindex.
- Horizontal card tracks are keyboard-scrollable and expose real focusable items;
  a mouse drag is never the only way to reach content.

### Screen readers

- Semantic landmarks: `header`, `nav`, `main`, `aside`, `footer`, one `h1` per page.
- Headings are hierarchical; no level is skipped for visual reasons.
- Images carry meaningful alt text; decorative and 3D canvases are `aria-hidden`
  with an adjacent text description of the scene.
- Order status changes are announced through `aria-live="polite"`; payment
  failures through `role="alert"`.
- Cart count is announced as "Cart, 3 items", not "3".
- Form errors use `aria-invalid` + `aria-describedby`, and the error summary at
  the top of long forms links to each offending field.
- Admin tables use proper `th`/`scope`, a caption, and announce sort state.
- Mobile uses `accessibilityLabel`, `accessibilityRole`, `accessibilityState` and
  `accessibilityLiveRegion`; tested with VoiceOver and TalkBack.

### Motion

- `prefers-reduced-motion: reduce` (and the native equivalents) disables parallax,
  scroll-linked transforms, autoplay carousels and the photo booth flash; large
  movement becomes opacity transitions ≤200ms.
- Nothing flashes more than three times per second — the photo booth camera flash
  is a single slow fade, and under reduced motion it does not fire at all.
- No content depends on animation to be understood. The scroll story reads
  correctly as a static page.

### Touch and targets

- 44×44 pt (iOS) / 48×48 dp (Android) minimum, 24×24 CSS px minimum on web with
  adequate spacing.
- 16px minimum gap between adjacent actions where one is destructive.
- All swipe gestures have a visible button alternative.
- Text reflows to 320px CSS width with no horizontal scrolling, and remains
  usable at 200% zoom and with OS text scaling up to 200%.

### Forms and input

- Visible persistent labels; placeholders never substitute for labels.
- Correct `inputMode`, `autocomplete` and `keyboardType` for phone, email,
  postcode and card fields.
- Errors appear on blur and on submit, never per keystroke while typing.
- Sessions and timers: the QR countdown and the branch SLA countdown can be
  extended or regenerated; no user is trapped by an unstoppable timer.

### Language

- `lang="en-MY"`. Korean dish names carry `lang="ko"` on the Hangul portion so
  screen readers pronounce them correctly.
- Prices announce as "16 ringgit" via `aria-label` rather than "RM16".

### Testing gate

Automated `axe-core` in CI on every page and Storybook story with zero
violations; manual keyboard walkthrough of the full ordering flow; VoiceOver and
TalkBack passes on the mobile checkout; a 200% zoom pass; a greyscale pass.

---

## 3. Responsive behaviour summary

### Website

| Element | 1440 desktop | 1024 tablet | 390 mobile |
|---|---|---|---|
| Grid | 12 col / 80 margin / 24 gutter | 8 col / 40 / 20 | 4 col / 20 / 16 |
| Header | Full nav + branch chip + CTA | Condensed nav, some items into "More" | Hamburger + logo + cart |
| Hero | Split text / 3D | Stacked, smaller scene | Text + static poster, sticky CTA |
| Food identity strip | 4 visible cards, arrows | 2.5 visible | 1.2 peek, swipe + dots |
| Featured menu | 4-up grid | 3-up | 2-up compact |
| Menu page | Rail + grid + cart rail | Chip bar + 2-up grid | Chip bar + 1-up rows + bottom bar |
| Food detail | 960px modal | 720px modal | Full-screen sheet |
| Cart | Two column | Stacked + sticky bar | Stacked + sticky total |
| Checkout | Form + sticky summary | Form + collapsible bottom summary | Stacked stepper + sticky bar |
| Locations | 2-up cards | 2-up narrow | 1-up stacked |
| Footer | 4 columns | 2 columns | Accordion |

### Mobile app

| Aspect | iOS 393×852 | Android 360×800 |
|---|---|---|
| Navigation | Tabs + swipe-back | Tabs + system back gesture |
| Sheets | UIKit-style with grabber | Material 3 bottom sheet |
| Press feedback | Opacity + haptic | Ripple |
| Typography | SF-adjacent metrics | Roboto-adjacent metrics |
| Safe area | Notch + home indicator | Status bar + gesture bar |
| Date/time pickers | Native wheel | Material picker |
| Share / save QR | Share sheet | Intent chooser |

Layouts converge on structure and diverge on chrome. Forcing pixel-identical
screens across platforms is explicitly not a goal.

### Admin

| Element | 1440 | 1280 |
|---|---|---|
| Sidebar | 240px expanded | 64px icon rail with tooltips |
| KPI strip | 5 across | 3 + 2 |
| Dashboard panels | Side by side | Stacked |
| Orders table | All columns | Secondary columns collapse into an expandable row |
| Detail drawer | 560px | 480px |

Below 1024 the admin shows a supported-resolution notice, with the exception of
Branch Confirmation and Kitchen Status, which are built responsively because
staff genuinely use them on a phone behind the counter.

---

## 4. Performance budgets

| Metric | Web (mid-range Android, 4G) | Admin | Mobile app |
|---|---|---|---|
| Largest Contentful Paint | < 2.5s | < 2.0s | — |
| Interaction to Next Paint | < 200ms | < 200ms | < 100ms |
| Cumulative Layout Shift | < 0.1 | < 0.1 | — |
| Initial JS (gzipped) | < 200 KB (3D excluded) | < 300 KB | — |
| 3D scene assets | < 800 KB desktop, < 400 KB mobile, lazy | n/a | n/a |
| Menu list scroll | 60fps | 60fps | 60fps |
| Cold start | — | — | < 2.5s |

Budgets are enforced in CI with Lighthouse and a bundle-size check. Exceeding a
budget fails the build rather than producing a warning nobody reads.
