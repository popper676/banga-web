# Information Architecture, Sitemap & Navigation

---

## 1. Content model (what the IA is built from)

Everything users navigate is one of nine content types. Getting these right once
means web, mobile and admin all agree on the same nouns.

| Content type | Key attributes | Where it surfaces |
|--------------|----------------|-------------------|
| **Brand story** | Static editorial copy + imagery | Home, Our Story |
| **Branch** | Name, address, hours, phone, geo point, delivery radius, fulfilment modes, open/closed | Locations, branch selector, checkout, admin |
| **Category** | Name, sort order, image, branch visibility | Menu nav, menu sections |
| **Product** | Name, description, images, base price, halal/Muslim-friendly flags, spice level, allergens, tags | Menu, search, detail, cart |
| **Option group → Option** | Group (size, sauce, spice, add-on), min/max select, required, price delta | Food detail, cart line |
| **Branch inventory** | Per branch × product: available / low / sold out | Menu cards, detail, cart validation |
| **Promotion / Voucher** | Type, value, conditions, branch and time scope, badge label | Promotions, menu badges, cart, checkout |
| **Order** | Items, fulfilment mode, branch, address, totals, status, payment, delivery | Cart → Tracking → History → Admin |
| **Account** | Profile, addresses, payment references, notification prefs | Account area, checkout |

Two structural decisions worth stating explicitly:

**Menu is branch-scoped, not global.** A product's price, availability and
promotions all depend on the selected branch. The IA therefore forces a branch
context *before* the menu is meaningful — but it never blocks browsing: an
unselected user sees the SS15 menu as the default preview with a persistent
"Showing SS15 · Change branch" control.

**Marketing and transaction are separated in pace, not in place.** The homepage
tells the story with 3D and scroll motion; from Section 5 onward it behaves like
a shop. Any route under `/menu`, `/cart`, `/checkout`, `/orders` is a fast,
motion-light zone.

---

## 2. Global information architecture

```
BANG GA BANG GA
│
├── DISCOVER  (brand-led, storytelling pace)
│   ├── Home
│   ├── Our Story
│   ├── Photo Booth
│   ├── Locations
│   └── Promotions
│
├── ORDER  (task-led, fast pace)
│   ├── Menu  →  Category  →  Food detail
│   ├── Search
│   ├── Cart
│   └── Checkout  →  Payment  →  Confirmation
│
├── TRACK  (status-led, realtime)
│   ├── Track Order (guest, by order code)
│   ├── Order tracking (authenticated)
│   └── Receipt
│
├── ACCOUNT  (identity-led)
│   ├── Profile
│   ├── Saved addresses
│   ├── Order history → Reorder
│   ├── Vouchers
│   └── Notifications
│
└── OPERATE  (admin only, separate app)
    ├── Live operations
    ├── Catalogue
    ├── Money
    ├── Customers & marketing
    └── Configuration
```

---

## 3. Website sitemap

```
/                                   Home (8-section scroll story)
/story                              Our Story
/menu                               Menu (branch-scoped, all categories)
/menu/[category]                    Category view
/menu/[category]/[product]          Food detail (also opens as a modal over /menu)
/search                             Search + filters
/promotions                         Promotions & vouchers
/promotions/[slug]                  Promotion detail
/photo-booth                        Photo booth experience
/locations                          Find us — both branches
/locations/[branch]                 Branch detail
/cart                               Cart
/checkout                           Checkout (fulfilment → address → review)
/checkout/address                   Address selection / new address
/checkout/branch                    Branch selection
/checkout/payment                   Payment method + processing
/checkout/processing                Payment processing (polling / redirect return)
/checkout/confirmation              Branch confirmation wait → accepted / rejected
/track                              Track order entry (guest, order code + phone)
/orders/[id]                        Order tracking (live)
/orders/[id]/receipt                Receipt (view / download PDF)
/account                            Profile
/account/addresses                  Saved addresses
/account/orders                     Order history
/account/orders/[id]                Past order → Reorder
/account/vouchers                   My vouchers
/account/notifications              Notification preferences
/login                              Login (email / OTP / social)
/register                           Registration
/guest                              Guest checkout identity capture
/contact                            Contact
/legal/privacy, /legal/terms        Legal
404, 500, /offline                  System pages
```

**Route rules**

- Food detail is a parallel/intercepting route: from the menu it opens as a modal
  and keeps the grid scroll position; opened directly it renders as a full page
  with its own metadata. Same component, two shells.
- `/checkout/*` is a linear stepper with guarded forward navigation. Back is always
  allowed and never destroys cart state.
- `/orders/[id]` is reachable by an authenticated owner or by a guest holding the
  signed order token issued at checkout. No enumeration by sequential ID.

### Desktop navigation (1440 / 1024)

Persistent header, cream background, condenses to a compact bar on scroll past the hero.

```
[BANG GA BANG GA]   Home · Our Story · Menu · Promotions · Photo Booth · Locations · Track Order
                                              [Branch: SS15 ▾] [Account] [Cart ③] [ Order Now ]
```

- `Order Now` is the only coral CTA in the header — one primary action per view.
- The branch chip shows the active branch and its open/closed state; it is the
  entry point to the branch switcher everywhere in the app.
- Cart shows a live item count and is reachable from every route including
  marketing pages.

### Mobile navigation (390)

```
Top bar:     [☰]   BANG GA BANG GA   [Cart ③]
Drawer:      Home · Our Story · Menu · Promotions · Photo Booth · Locations ·
             Track Order · Account · Login
Bottom bar:  [Home] [Menu] [Cart] [Orders] [Account]     ← appears on ordering routes
Sticky CTA:  [ Order Now ]  on marketing routes, above the safe area
```

The bottom bar is shown on `/menu`, `/cart`, `/checkout`, `/orders`, `/account`
and hidden on the storytelling routes, where a single sticky `Order Now` button
does the job without competing with the scroll narrative.

---

## 4. Homepage scroll structure

Eight sections, alternating pace. The scroll story is only allowed to be slow
before Section 5.

| # | Section | Pace | Motion budget |
|---|---------|------|---------------|
| 1 | Hero — "NICE TO MEET YOU. NOW, LET'S EAT." | Slow | R3F food scene, pointer parallax, scroll-linked rotation. CTAs interactive immediately |
| 2 | Brand story — "TRADITION & TRENDY" | Slow | GSAP reveal on text and imagery only |
| 3 | Food identity — 4 pillars, under RM20, Muslim-friendly | Medium | Horizontal layered food strip; keyboard + swipe navigable, never scroll-jacked |
| 4 | Everyday moments — "Come hungry. Leave smiling." | Medium | Lifestyle imagery, opacity/translate reveal |
| 5 | Featured menu | **Fast** | No 3D. Cards, badges, Add to Cart |
| 6 | Photo booth — "MORE THAN A MEAL." / "MAKE IT LAST." | Slow | Floating photo strips, curtain reveal, soft flash. Reduced-motion alternative required |
| 7 | Locations — "FIND US" | Medium | Static maps, branch cards |
| 8 | Closing CTA — "MAKE IT LAST." | Slow | Final R3F brand moment |

Section 3's horizontal presentation uses a scroll-snap track with real focusable
buttons, arrow-key support and visible scrollbars on desktop — not a GSAP pin
that traps the page.

---

## 5. Mobile application navigation

Expo Router, file-based, with a bottom tab navigator and native stacks per tab.

```
(tabs)
├── index            Home      — greeting, branch chip, promos, quick reorder, categories
├── menu             Menu      — sticky category rail, search, branch-aware availability
├── orders           Orders    — Active (live tracking) | History (reorder)
├── promotions       Promotions— offers, vouchers, claim
└── account          Account   — profile, addresses, payments, notifications, support

Modal / stack routes
├── product/[id]                 Food detail bottom sheet → full screen
├── cart                         Cart (also reachable via persistent cart pill)
├── checkout/(fulfilment|address|branch|review|payment|processing|confirmation)
├── order/[id]                   Live tracking with map
├── order/[id]/receipt           Receipt
├── auth/(login|register|otp)    Auth stack
└── permissions/(location|notifications|camera)  Priming screens
```

**Behaviour requirements**

- Minimum touch target 44 × 44 pt (iOS) / 48 × 48 dp (Android); 16px minimum
  spacing between adjacent destructive and safe actions.
- A persistent cart pill floats above the tab bar whenever the cart is non-empty,
  showing item count and total.
- Android hardware back mirrors the stack; on a tab root it switches to Home
  before exiting, and it never silently discards a half-filled checkout form —
  it asks.
- iOS uses swipe-back and bottom sheets; Android uses Material bottom sheets and
  the system back gesture. Layouts are allowed to differ.
- Safe areas respected top and bottom; the checkout pay button sits above the
  home indicator, never under it.
- Permissions are primed in-app with a plain explanation before the OS prompt,
  and every permission has a working denied-state path (manual address entry,
  in-app status instead of push, upload instead of camera).

---

## 6. Admin navigation

Desktop-first, fixed left sidebar (240px, collapsible to 64px at 1280),
top bar with global branch scope, search, alert bell and the signed-in operator.

```
LIVE OPERATIONS
  Dashboard                 Today's revenue, order counts, live queue, alerts
  Orders                    All orders, filters, search, bulk actions
  Branch Confirmation       Accept / reject queue — the highest-urgency screen
  Kitchen Status            Preparing → Ready board
  Delivery Tracking         Lalamove bookings, rider status, failures

CATALOGUE
  Menu Management           Products, pricing, images, availability
  Category Management       Order, visibility, branch scope
  Options & Add-ons         Option groups, price deltas, rules
  Inventory by Branch       Per-branch stock and sold-out toggles

MONEY
  Payments                  Transactions, gateway references, reconciliation
  Refunds                   Requests, automatic reversals, manual alerts
  Reports                   Sales, products, branch, delivery, promotions

MARKETING
  Promotions & Vouchers     Campaigns, codes, usage limits
  Customers                 Profiles, order history, notes

CONFIGURATION
  Branch Management         Hours, contact, delivery radius, fulfilment modes
  Admins & Roles            Users, roles, branch assignment
  Printer & POS             Receipt printers, ticket layout, auto-print rules
  Audit Logs                Immutable actor/action/entity trail
  System Settings           Tax, service charge, payment + delivery config
```

**Branch scope is global.** The top bar holds a branch selector
(`All branches` / `SS15` / `Taylor's Lakeside`). Branch staff are locked to their
own branch and do not see the selector. Every list, report and action inherits the
scope, so an operator can never accidentally accept another branch's order.

**Urgency ranking drives the layout.** Branch Confirmation and Kitchen Status are
time-critical, so they are reachable in one click from anywhere, show a live count
badge in the sidebar, and raise an audible + visual alert on new orders.

### Role matrix

| Capability | Super Admin | Branch Manager | Branch Staff | Kitchen | Finance |
|---|---|---|---|---|---|
| View all branches | Yes | Own | Own | Own | Yes |
| Accept / reject orders | Yes | Yes | Yes | No | No |
| Update kitchen status | Yes | Yes | Yes | Yes | No |
| Book Lalamove | Yes | Yes | Yes | No | No |
| Edit menu & prices | Yes | Request | No | No | No |
| Toggle branch inventory | Yes | Yes | Yes | Yes | No |
| Issue refunds | Yes | Up to limit | No | No | Yes |
| Manage promotions | Yes | No | No | No | No |
| Manage admins & roles | Yes | No | No | No | No |
| View reports | Yes | Own branch | No | No | Yes |
| View audit logs | Yes | Own branch | No | No | Yes |

---

## 7. Cross-surface consistency

| Concept | Web | Mobile | Admin |
|---------|-----|--------|-------|
| Branch context | Header chip | Home chip + menu header | Top bar scope selector |
| Cart | Header icon + `/cart` | Floating pill + tab | n/a |
| Order status | Tracker component | Tracker + push | Status column + board |
| Search | `/search` page | In-tab search field | Global top-bar search |
| Notifications | In-app banner + email | Push + in-app | Bell + audible alert |

The same status vocabulary is used on all three surfaces. Customers see friendly
labels; admin sees the technical status; both map to one enum defined in
`packages/core`. Mapping table in `02-customer-ordering-flow.md`.
