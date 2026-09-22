# Low-Fidelity Wireframes — 12 Priority Screens

Structure only. No colour, no photography, no type styling, no 3D renders — those
come after approval. Each screen lists its layout, the reasoning behind it, its
responsive behaviour and its non-happy states.

An interactive version of these wireframes is available as a canvas:
`bangga-lofi-wireframes.canvas.tsx`.

Legend: `▢` image/media slot · `▭` text block · `[ ]` button · `( )` input ·
`‹ ›` selectable chip

---

## 1. Homepage — 1440 desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ LOGO   Home Our Story Menu Promotions Photo Booth Locations Track        │
│                                   ‹Branch: SS15 ▾› [Acct] [Cart 3] [ORDER]│
├──────────────────────────────────────────────────────────────────────────┤
│ S1 HERO                                        ┌────────────────────┐    │
│ ▭ NICE TO MEET YOU.                            │                    │    │
│ ▭ NOW, LET'S EAT.                              │   ▢ 3D food scene  │    │
│ ▭ Welcome to BANG GA BANG GA — Korean          │   (lazy, poster    │    │
│   tradition meets modern, fun dining.          │    fallback)       │    │
│ [ Explore Our Menu ]  [ Order Now ]            └────────────────────┘    │
│                                    ▼ scroll                              │
├──────────────────────────────────────────────────────────────────────────┤
│ S2 BRAND STORY                                                           │
│ ┌──────────────────┐  ▭ TRADITION & TRENDY                               │
│ │  ▢ founders /    │  ▭ Inspired by the Korean expression Bang Ga Bang   │
│ │    restaurant    │    Ga, meaning "Nice to meet you"…                  │
│ └──────────────────┘  ▭ More than three years of Korean favourites.      │
├──────────────────────────────────────────────────────────────────────────┤
│ S3 FOOD IDENTITY   ▭ TRADITION & TRENDY                                  │
│ ◀ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ▶   ‹•••• pagination›      │
│   │▢ dish  │ │▢ dish  │ │▢ dish  │ │▢ dish  │                            │
│   └────────┘ └────────┘ └────────┘ └────────┘                            │
│ [Korean flavours] [Boneless chicken] [Affordable] [Modern Korean]        │
│ ▭ Individual sets under RM20 · Muslim-friendly                           │
├──────────────────────────────────────────────────────────────────────────┤
│ S4 EVERYDAY MOMENTS  ▢ ▢ ▢ lifestyle collage                             │
│ ▭ Lunch between classes · friends · family · Korean comfort food         │
│ ▭ Come hungry. Leave smiling.          [ Explore Our Menu ]              │
├──────────────────────────────────────────────────────────────────────────┤
│ S5 FEATURED MENU   ‹All›‹Chicken›‹Sets›‹Sides›‹Drinks›   [View full menu]│
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│ │▢  [PROMO]│ │▢        │ │▢        │ │▢ SOLD  │  ← fast zone, no 3D      │
│ │▭ name   │ │▭ name   │ │▭ name   │ │  OUT   │                          │
│ │▭ desc   │ │▭ desc   │ │▭ desc   │ │▭ name  │                          │
│ │RM16 [+] │ │RM18 [+] │ │RM12 [+] │ │RM20    │                          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                          │
├──────────────────────────────────────────────────────────────────────────┤
│ S6 PHOTO BOOTH   ▭ MORE THAN A MEAL.                                     │
│   ▢ floating photo strips (3D)      ▭ Good food brings people together.  │
│   ▭ MAKE IT LAST.                   ▭ Sessions from RM1.                 │
│   ▭ Eat together. Snap together. Make it last.                           │
├──────────────────────────────────────────────────────────────────────────┤
│ S7 FIND US                                                               │
│ ┌────────────────────────────┐  ┌────────────────────────────┐           │
│ │ ▭ SS15, Subang Jaya  ●OPEN │  │ ▭ Taylor's Lakeside ●CLOSED│           │
│ │ ▭ address · hours · phone  │  │ ▭ address · hours · phone  │           │
│ │ ▢ map                      │  │ ▢ map                      │           │
│ │ ‹Dine-in›‹Pickup›‹Delivery›│  │ ‹Dine-in›‹Pickup›          │           │
│ │ [Directions] [Order here]  │  │ [Directions] [Order here]  │           │
│ └────────────────────────────┘  └────────────────────────────┘           │
├──────────────────────────────────────────────────────────────────────────┤
│ S8 CLOSING   ▭ BANG GA BANG GA · TRADITION & TRENDY                      │
│ ▭ Korean flavours. Good food. Great memories.   ▭ MAKE IT LAST.          │
│ [ Explore Our Menu ] [ Order Now ] [ Find a Location ]                   │
├──────────────────────────────────────────────────────────────────────────┤
│ FOOTER  menu · locations · story · photo booth · contact · legal · social│
└──────────────────────────────────────────────────────────────────────────┘
```

**Reasoning.** The page is a funnel: story for three sections, then a hard switch
to commerce at S5. The hero's CTAs sit in the DOM before the 3D canvas mounts, so
a user can reach the menu while the scene is still downloading. S3's horizontal
track is a real scroll container with arrow buttons and pagination dots — it never
hijacks vertical scroll.

**Responsive.** 1024: hero stacks to text-over-media, S2 becomes single column,
S5 goes 3-up, S7 stays 2-up. 390: everything single column, hero 3D replaced by a
static poster by default, S3 becomes a swipeable 1.2-card peek, S5 goes 2-up with
compact cards, a sticky `Order Now` bar sits above the safe area.

**States.** 3D loading → poster image; WebGL unsupported → poster permanently;
reduced motion → no parallax, opacity-only reveals, frozen scene; menu fetch error
→ S5 shows a retry row while the rest of the page still renders.

---

## 2. Menu — 1440 desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER (condensed)                     ‹Branch: SS15 · Open ▾› [Cart 3]  │
├──────────────────────────────────────────────────────────────────────────┤
│ ( 🔍 Search the menu )        ‹Pickup | Delivery›   ‹Muslim-friendly ✓›  │
├───────────────┬──────────────────────────────────────────────────────────┤
│ CATEGORY RAIL │  ▭ Signature Chicken                    12 items         │
│ (sticky)      │  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ • Signature   │  │ ▢ [PROMO]│ │ ▢        │ │ ▢ LOW    │                  │
│ • Sets        │  │ ▭ name   │ │ ▭ name   │ │ ▭ name   │                  │
│ • Sides       │  │ ▭ desc   │ │ ▭ desc   │ │ ▭ desc   │                  │
│ • Drinks      │  │ RM16 [+] │ │ RM18 [+] │ │ RM14 [+] │                  │
│ • Add-ons     │  └──────────┘ └──────────┘ └──────────┘                  │
│ • Promotions  │  ▭ Sets                                  8 items         │
│               │  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│               │  │ …        │ │ …        │ │ ▢ SOLD   │                  │
│               │  └──────────┘ └──────────┘ └ OUT ─────┘                  │
├───────────────┴──────────────────────────────────────────────────────────┤
│ STICKY CART SUMMARY (desktop right rail ≥1280)                           │
│ ▭ 3 items · RM52.40                                    [ View cart ]     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Reasoning.** Two-pane: a sticky category rail for orientation, a scrolling grid
for browsing, and at ≥1280 a right cart rail so adding items never costs a page
change. Scroll-spy keeps the rail in sync with the grid. Branch availability is
rendered on the card itself, because discovering "sold out" in the cart is the
worst possible moment.

**Card anatomy (reused everywhere).** image · promo badge · name · one-line
description · price · availability chip · add button. Nothing else — overcrowded
cards are an explicit non-goal.

**Responsive.** 1024: rail collapses to a horizontal sticky chip bar, grid 2-up,
cart becomes a bottom bar. 390: chip bar with a category sheet, 1-up cards with
horizontal layout (thumbnail left, text right) so more items fit per screen,
persistent bottom cart bar.

**States.** Skeleton cards on load (never a spinner over the whole grid); empty
category → "Nothing here yet at SS15" + switch-branch link; search no-results →
suggestions + clear filters; offline → cached menu with a banner and disabled Add;
branch closed → banner offering pre-order or the other branch.

---

## 3. Food detail — 1440 desktop (modal over menu)

```
┌────────────────────────── modal 960px ───────────────────────────┐
│ [✕]                                                              │
│ ┌──────────────────────┐  ▭ Korean Soy Boneless Chicken          │
│ │                      │  ▭ RM16.00      ‹Muslim-friendly›       │
│ │   ▢ image gallery    │  ▭ Boneless chicken tossed in a sweet   │
│ │   ○ ● ○ ○            │    soy garlic glaze…                    │
│ └──────────────────────┘  ‹Available at SS15›                    │
│                                                                  │
│ ▭ Size *required*            ○ Regular  ● Large +RM5.00          │
│ ▭ Sauce *choose 1*           ○ Soy  ○ Spicy  ○ Honey             │
│ ▭ Spice level                ○ Mild ○ Medium ○ Hot               │
│ ▭ Add-ons *up to 3*          ☐ Cheese +RM3  ☐ Rice +RM2  ☐ …     │
│ ▭ Notes for the kitchen                                          │
│ ( e.g. less spicy please )                             0/200     │
│ ▭ We'll do our best, but changes aren't guaranteed.              │
├──────────────────────────────────────────────────────────────────┤
│ STICKY FOOTER   [− 2 +]            [ Add to cart · RM42.00 ]     │
└──────────────────────────────────────────────────────────────────┘
```

**Reasoning.** Required groups are marked in text, not just by a disabled button,
and the button carries the live total so the price is never a surprise. The footer
is sticky so long option lists don't push the action off screen.

**Responsive.** 1024: modal 720px. 390: full-screen sheet with a drag handle,
image at 4:3, sticky footer above the safe area, and the quantity stepper sized
to 48dp targets.

**States.** Option combination unavailable → that option is disabled with a
reason chip ("Large sold out today"); item sold out → the footer becomes
"Notify me when available"; validation → the first unmet required group scrolls
into view and is announced to screen readers.

---

## 4. Cart — 1440 desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                   │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ▭ Your cart (3 items)                      │ ORDER SUMMARY (sticky)      │
│ ‹Branch: SS15 · Subang Jaya›  [Change]     │ ▭ Subtotal        RM52.40   │
│                                            │ ▭ Promotion      −RM5.00    │
│ ┌────────────────────────────────────────┐ │ ▭ Delivery fee    RM6.50    │
│ │ ▢ │ ▭ Soy Boneless Chicken             │ │ ▭ Service/SST     RM2.10    │
│ │   │ ▭ Large · Soy · +Cheese            │ │ ────────────────────────    │
│ │   │ ▭ "less spicy please"              │ │ ▭ TOTAL          RM56.00    │
│ │   │ [− 2 +]     RM42.00      [Remove]  │ │                             │
│ └────────────────────────────────────────┘ │ ( Voucher code )  [Apply]   │
│ ┌────────────────────────────────────────┐ │                             │
│ │ ▢ │ ▭ Cheese Tteokbokki   ⚠ SOLD OUT   │ │ [ Continue to checkout ]    │
│ │   │ ▭ Unavailable at SS15 today        │ │ ▭ disabled until sold-out   │
│ │   │ [Remove]  [Find something similar] │ │   items are resolved        │
│ └────────────────────────────────────────┘ │                             │
│ ▭ Frequently added  ‹+ Rice› ‹+ Drink›     │                             │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Reasoning.** The branch is shown at the top of the cart because every price and
availability statement below it depends on that branch. Sold-out lines block
checkout but offer a one-tap resolution rather than just an error.

**Responsive.** 1024: summary moves below the list, CTA becomes a sticky bottom
bar. 390: single column, swipe-to-remove with an undo toast, sticky total + CTA.

**States.** Empty cart → illustration + "Browse the menu"; price changed since
adding → inline diff row with accept/remove; voucher invalid → inline reason
(expired / minimum not met / wrong branch); cart revalidation in progress →
summary values skeleton, CTA disabled with "Checking availability".

---

## 5. Checkout — 1440 desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ① Fulfilment ──── ② Details ──── ③ Review ──── ④ Payment                 │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ‹ PICKUP ›  ‹ DELIVERY ●›                  │ SUMMARY (sticky)            │
│                                            │ ▭ 3 items                   │
│ ▭ Deliver to                               │ ▭ Subtotal      RM52.40     │
│ ┌────────────────────────────────────────┐ │ ▭ Promotion    −RM5.00      │
│ │ ● Home · 12 Jalan SS15/4, Subang Jaya  │ │ ▭ Delivery      RM6.50      │
│ │ ○ Office · Menara …                    │ │   ▭ quote valid 4:38        │
│ │ [+ Add a new address]                  │ │ ▭ SST           RM2.10      │
│ └────────────────────────────────────────┘ │ ──────────────────────      │
│                                            │ ▭ TOTAL        RM56.00      │
│ ▭ Fulfilling branch                        │                             │
│ ┌────────────────────────────────────────┐ │ [ Continue to payment ]     │
│ │ ● SS15 · 2.3 km · ~35 min  ●OPEN       │ │                             │
│ │ ○ Taylor's Lakeside · 7.1 km ●CLOSED   │ │                             │
│ └────────────────────────────────────────┘ │                             │
│                                            │                             │
│ ▭ Contact                                  │                             │
│ ( Name )  ( Phone )  ( Email for receipt ) │                             │
│ ☐ Create an account to track future orders │                             │
│                                            │                             │
│ ▭ Delivery notes  ( gate code, landmark )  │                             │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Reasoning.** One page with a visible four-step progress indicator rather than
four separate pages — fewer round trips, and the user can see how much is left.
The quote timer is visible, so a fee change later is never a shock. Account
creation is an opt-in checkbox, never a wall.

**Responsive.** 1024: summary collapses into an expandable bar pinned to the
bottom. 390: fully stacked; the address list becomes a sheet; the sticky bar
shows total + CTA and expands on tap to reveal the breakdown.

**States.** No saved addresses → the form is inline rather than an empty list;
address outside radius → the delivery option is disabled with a reason and pickup
is pre-selected; branch closed → the option is disabled with the next opening time;
quote expired → re-quote inline with a "fee updated" notice; guest → the contact
block is required and an order token is explained.

---

## 6. Payment — 1440 desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ① ── ② ── ③ ── ④ Payment                              ▭ Total RM56.00   │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ▭ Choose how to pay                        │ ▭ Order summary (read only) │
│ ┌────────────────────────────────────────┐ │ ▭ SS15 · Delivery           │
│ │ ● Visa / Mastercard                    │ │ ▭ 3 items                   │
│ │   ( Card number      )                 │ │ ▭ TOTAL         RM56.00     │
│ │   ( MM/YY ) ( CVC )                    │ │                             │
│ │   ▭ hosted fields — card data never    │ │ ▭ Secured by <gateway>      │
│ │     touches BANG GA BANG GA servers    │ │ ▭ Prices include SST        │
│ ├────────────────────────────────────────┤ │                             │
│ │ ○ DuitNow QR                           │ │                             │
│ │   ▢ dynamic QR            ⏱ 09:42      │ │                             │
│ │   ▭ Scan with any Malaysian bank app   │ │                             │
│ │   ▭ Waiting for payment…  ◌            │ │                             │
│ └────────────────────────────────────────┘ │                             │
│ ☐ Save this card for next time             │                             │
│ [ Pay RM56.00 ]                            │                             │
└────────────────────────────────────────────┴─────────────────────────────┘

PROCESSING STATE (full screen, replaces the above)
┌──────────────────────────────────────────────────────────────────────────┐
│                          ◌  Processing your payment                      │
│            ▭ Do not close this window. This usually takes a few seconds. │
│            ▭ If you were charged, your order will appear automatically.  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Reasoning.** Two methods, both visible, no hidden dropdown. The QR carries a
visible countdown and a live status line so the user knows polling is happening.
The processing screen is deliberately blunt about not closing the window, and
reassures about double charges — the two things people actually worry about.

**Responsive.** 390: methods become full-width accordions; the QR renders at a
scannable minimum of 240 × 240 px with a "save to photos" action; on mobile web
and in the app we deep-link to banking apps where supported and fall back to QR.

**States.** Declined → reason + retry with the same order, never a new order;
3DS challenge → redirect with a return URL that lands on processing; QR expired →
regenerate button; network lost while processing → "We'll keep checking" with
polling; success → auto-advance to branch confirmation.

---

## 7. Branch confirmation (customer waiting screen)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     ▭ Payment received · RM56.00                         │
│                     ▭ Order #BG-240921-0138                              │
│                                                                          │
│                  ◌  Waiting for SS15 to confirm your order               │
│                     ▭ Usually under 5 minutes        ⏱ 4:12 left         │
│                                                                          │
│   ●━━━━━━━━○━━━━━━━━○━━━━━━━━○━━━━━━━━○                                  │
│   Confirmed  Preparing  Ready   On the way  Delivered                    │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ ▭ Your order            3 items · Delivery to 12 Jalan SS15/4        │ │
│ │ ▭ Soy Boneless Chicken ×2 · Cheese Tteokbokki ×1          RM56.00    │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ ▭ If the branch can't confirm in time, we'll refund you automatically.   │
│ [ Call SS15 ]   [ View order ]                                           │
└──────────────────────────────────────────────────────────────────────────┘

REJECTED VARIANT
│ ⚠ ▭ SS15 couldn't take this order                                       │
│   ▭ Reason: an item is unavailable right now                            │
│   ▭ Refund of RM56.00 started · ref RF-8842 · 3–5 working days          │
│   [ Order from Taylor's Lakeside ]   [ Back to menu ]                   │
```

**Reasoning.** Waiting is the highest-anxiety moment in the whole flow, so this
screen answers all four questions people have: did the payment go through, how
long will this take, what happens if it fails, and can I talk to a human. Status
arrives over Supabase Realtime with a polling fallback, so a dropped socket does
not leave the customer staring at a stale spinner.

**Responsive.** 390: the tracker becomes vertical, the order summary collapses,
and the call button is a full-width primary action.

**States.** Realtime disconnected → silently fall back to 10s polling, show a
subtle "live" indicator only when connected; accepted → animate to the Preparing
step and route to tracking; SLA elapsed → auto-reject variant with refund details.

---

## 8. Order tracking

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ‹ Back      ▭ Order #BG-240921-0138        ▭ ETA 7:45 PM                 │
├────────────────────────────────────────────┬─────────────────────────────┤
│ ┌────────────────────────────────────────┐ │ ● Confirmed      7:02 PM    │
│ │                                        │ │ ● Preparing      7:05 PM    │
│ │        ▢ live map                      │ │ ● Ready          7:22 PM    │
│ │        ● branch  ● rider  ● you        │ │ ● Rider assigned 7:26 PM    │
│ │                                        │ │ ◐ Out for delivery 7:31 PM  │
│ └────────────────────────────────────────┘ │ ○ Delivered                 │
│ ┌────────────────────────────────────────┐ │                             │
│ │ ▢ │ ▭ Rider: Ahmad · Yamaha · WXY 1234 │ │ ▭ Delivering to             │
│ │   │ [ Call ]  [ Message ]              │ │ ▭ 12 Jalan SS15/4…          │
│ └────────────────────────────────────────┘ │ ▭ Notes: gate code 1234     │
│ ▭ Order items (collapsed)              [▾] │ [ View receipt ]            │
│ ▭ Need help?  [ Contact SS15 ]             │ [ Reorder ]                 │
└────────────────────────────────────────────┴─────────────────────────────┘
```

**Reasoning.** Map and timeline side by side: the map answers "where", the
timeline answers "what happened and when". Timestamps build trust far better than
a progress bar alone. Pickup orders drop the map and rider block and show a
collection code instead.

**Responsive.** 390: map on top at 40% viewport height, timeline below in a
draggable sheet, rider card pinned above it.

**States.** Pre-rider → map shows the branch only with "Finding a rider";
delivery failed → the timeline shows a failure node with the reason and recovery
actions; completed → map collapses, receipt and reorder are promoted; guest →
same screen reached by the signed token, with an "add to account" prompt.

---

## 9. Mobile app — Home (393 × 852)

```
┌───────────────────────────────┐
│ ▭ Good evening, Aisyah        │  ← safe area
│ ‹SS15 · Open until 10 PM ▾›   │
│ ( 🔍 Search Korean food )     │
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ ▢ promo banner   ● ○ ○    │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ ▭ Order again                 │
│ ┌────────┐ ┌────────┐ ┌─────  │
│ │▢ last  │ │▢       │ │▢      │  ← horizontal scroll
│ │RM42 [↻]│ │RM18 [↻]│ │       │
│ └────────┘ └────────┘ └─────  │
├───────────────────────────────┤
│ ▭ Categories                  │
│ ┌─────┐┌─────┐┌─────┐┌─────┐  │
│ │▢Chk ││▢Set ││▢Side││▢Drk │  │
│ └─────┘└─────┘└─────┘└─────┘  │
├───────────────────────────────┤
│ ▭ Popular now                 │
│ ┌───────────────────────────┐ │
│ │▢ │ ▭ name   RM16    [+]   │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │▢ │ ▭ name   RM18    [+]   │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│  ▭ 3 items · RM52.40   [Cart] │  ← floating cart pill
├───────────────────────────────┤
│ [Home] [Menu] [Orders] [Promo] [Account] │
└───────────────────────────────┘
```

**Reasoning.** The app is for repeat customers, so the first two blocks below the
branch chip are the ones that shortcut a whole ordering session: search and
"Order again". No 3D, no brand storytelling above the fold — that job belongs to
the website.

**Android (360 × 800).** Same structure; Material ripple instead of opacity press
states, bottom bar follows Material 3 metrics, back gesture supported, and the
greeting row is slightly tighter to compensate for the shorter viewport.

**States.** Not signed in → greeting becomes "Welcome" with a sign-in chip and
"Order again" is replaced by "Popular now"; location denied → branch chip reads
"Choose a branch"; offline → cached home with a banner, Add buttons disabled;
first launch → location and notification priming screens before any OS prompt.

---

## 10. Mobile app — Menu (393 × 852)

```
┌───────────────────────────────┐
│ ‹ SS15 ▾ ›     ( 🔍 )   [⚙]   │
│ ‹All›‹Chicken›‹Sets›‹Sides›‹D›│  ← sticky, horizontally scrollable
├───────────────────────────────┤
│ ▭ Signature Chicken           │
│ ┌───────────────────────────┐ │
│ │ ▢ │ ▭ Soy Boneless Chicken│ │
│ │   │ ▭ sweet soy garlic…   │ │
│ │   │ ▭ RM16  [PROMO]  [+]  │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ▢ │ ▭ Spicy Boneless      │ │
│ │   │ ▭ RM18           [+]  │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ▢ │ ▭ Cheese Tteokbokki   │ │
│ │   │ ⚠ Sold out at SS15    │ │
│ └───────────────────────────┘ │
│ ▭ Sets                        │
│ ┌───────────────────────────┐ │
│ │ ▢ │ ▭ …              [+]  │ │
├───────────────────────────────┤
│  ▭ 3 items · RM52.40   [Cart] │
├───────────────────────────────┤
│ [Home] [Menu] [Orders] [Promo] [Account] │
└───────────────────────────────┘
```

**Reasoning.** Horizontal list rows rather than a card grid: on a 393pt screen
this shows roughly three items per viewport instead of two, and keeps the price
and add button on a consistent right edge for thumb reach. The category chips are
sticky and scroll-spy with the list. Tapping `[+]` on an item with required options
opens the detail sheet; items with no required options add directly with haptic
feedback.

**States.** Section loading → three skeleton rows; sold out → row dimmed with a
text chip, `[+]` replaced by "Notify me"; search active → chips hide and results
replace sections; branch switch → full list revalidates with a brief inline
"Updating menu for Taylor's Lakeside".

---

## 11. Admin — Dashboard (1440)

```
┌────────────┬─────────────────────────────────────────────────────────────┐
│ BANG GA    │ ‹Branch: All ▾›  ( search orders )      [🔔 3]  ▭ Aisyah ▾  │
│ ADMIN      ├─────────────────────────────────────────────────────────────┤
│            │ ▭ Today · 21 Sep 2026                    ‹Today›‹7d›‹30d›   │
│ ● Dashboard│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐         │
│ ○ Orders ③ │ │ RM4,280 │   68    │    3    │   12    │  RM63   │         │
│ ○ Confirm ③│ │ Revenue │ Orders  │ Waiting │Preparing│ Avg     │         │
│ ○ Kitchen  │ └─────────┴─────────┴─────────┴─────────┴─────────┘         │
│ ○ Delivery │ ┌──────────────────────────────┬──────────────────────────┐ │
│            │ │ ⚠ NEEDS ATTENTION            │ ▭ Orders by hour         │ │
│ CATALOGUE  │ │ • 3 orders waiting (2m 40s)  │ ▢ bar chart              │ │
│ ○ Menu     │ │ • 1 delivery failed          │                          │ │
│ ○ Category │ │ • 1 manual refund required   │ ▭ Revenue by branch      │ │
│ ○ Options  │ │ • 2 items low stock at SS15  │ ▢ split bar              │ │
│ ○ Inventory│ └──────────────────────────────┴──────────────────────────┘ │
│            │ ▭ Live order queue                          [ Open Orders ] │
│ MONEY      │ ┌─────────────────────────────────────────────────────────┐ │
│ ○ Payments │ │ Order │ Branch │ Type │ Total │ Status    │ Age │ Action │ │
│ ○ Refunds  │ │ 0138  │ SS15   │ Del  │ 56.00 │ ●Waiting  │2:40 │[Accept]│ │
│ ○ Reports  │ │ 0137  │ SS15   │ Pick │ 18.00 │ ●Preparing│6:12 │[Ready] │ │
│            │ │ 0136  │ TLC    │ Del  │ 92.50 │ ●Out      │18:03│[Track] │ │
│ MARKETING  │ └─────────────────────────────────────────────────────────┘ │
│ ○ Promos   │                                                             │
│ ○ Customers│                                                             │
│ CONFIG …   │                                                             │
└────────────┴─────────────────────────────────────────────────────────────┘
```

**Reasoning.** The dashboard is an operations console, not a reporting page. KPIs
are one row; below them the left half is "what needs a human right now" and the
right half is context. The live queue with inline actions means the most common
task — accepting an order — takes one click from the landing screen. The waiting
count is also a sidebar badge and drives an audible alert.

**Responsive.** 1280: sidebar collapses to icons with tooltips, the KPI strip
wraps to 3 + 2, and charts stack under the attention panel. Below 1024 the admin
shows a supported-resolution notice with a link to the mobile-friendly
confirmation and kitchen views only.

**States.** Loading → skeleton KPI tiles and table rows; no orders yet today →
"Quiet so far" with a shortcut to the menu; realtime disconnected → amber bar
"Reconnecting — data may be delayed" with a manual refresh; staff role → sees only
their branch and the modules their role allows.

---

## 12. Admin — Order management (1440)

```
┌────────────┬─────────────────────────────────────────────────────────────┐
│ SIDEBAR    │ ▭ Orders                    ‹Branch: SS15 ▾›  [Export CSV]  │
│            ├─────────────────────────────────────────────────────────────┤
│            │ ( search order # / phone / name )  ‹Today ▾› ‹Status ▾›     │
│            │ ‹Type ▾› ‹Payment ▾›  [Clear]        ▭ 68 results           │
│            ├─────────────────────────────────────────────────────────────┤
│            │ ☐│Order│Time │Customer│Type│Items│Total │Payment│Status│ ⋯  │
│            │ ☐│0138 │19:02│Aisyah  │Del │  3  │56.00 │●Paid  │●Wait │[▸] │
│            │ ☐│0137 │18:55│Wei Jie │Pick│  1  │18.00 │●Paid  │●Prep │[▸] │
│            │ ☐│0136 │18:31│Kumar   │Del │  5  │92.50 │●Paid  │●Out  │[▸] │
│            │ ☐│0135 │18:12│Sarah   │Del │  2  │34.00 │●Refund│●Rejd │[▸] │
│            │ ‹1› ‹2› ‹3› … ‹7›            ▭ Rows per page ‹25 ▾›         │
└────────────┴─────────────────────────────────────────────────────────────┘

DETAIL DRAWER (slides from the right, 560px — list stays visible)
┌─────────────────────────────────────────────┐
│ [✕] ▭ Order #BG-240921-0138   ●Waiting 2:40 │
│ ▭ Aisyah · +60 12-345 6789   [Call]         │
│ ▭ Delivery · 12 Jalan SS15/4 · 2.3 km       │
│ ▭ Notes: gate code 1234                     │
│ ─────────────────────────────────────────── │
│ ▭ Items                                     │
│ ▭ 2× Soy Boneless (Large, Soy, +Cheese)     │
│ ▭   "less spicy please"          RM42.00    │
│ ▭ 1× Cheese Tteokbokki           RM14.00    │
│ ▭ Promotion −RM5.00 · Delivery RM6.50       │
│ ▭ TOTAL                          RM56.00    │
│ ─────────────────────────────────────────── │
│ ▭ Payment  Visa ••4242 · txn_9f2a · Paid    │
│ ▭ Delivery Lalamove — not booked            │
│   [ Get quotation ]  [ Book delivery ]      │
│ ─────────────────────────────────────────── │
│ ▭ Timeline                                  │
│ ▭ 19:02 Created · 19:02 Paid · 19:02 Sent   │
│ ─────────────────────────────────────────── │
│ [ Accept order ]      [ Reject… ]           │
└─────────────────────────────────────────────┘
```

**Reasoning.** A drawer rather than a separate page: staff triage a queue, and
losing the list on every inspection is the main source of slow confirmations.
Reject opens a dialog requiring a reason from a fixed list, shows exactly what
will be refunded, and requires explicit confirmation — it is destructive and
irreversible. Every action is optimistic in the UI but authoritative on the server,
and conflicts (another operator accepted first) resolve with a clear message
instead of a silent overwrite.

**Bulk actions.** Selecting rows enables print tickets and export. Bulk accept is
deliberately *not* offered — accepting is a judgement about kitchen capacity.

**States.** Filters with no matches → "No orders match these filters" + clear;
export running → progress toast; row updated by realtime → brief highlight so
operators notice changes they did not make; permission denied → the action button
is replaced by an explanatory label, never a silent no-op.

---

## Approval checklist

- [ ] Homepage section order and the story → commerce switch at S5
- [ ] Menu two-pane layout and branch-scoped availability on cards
- [ ] Food detail required-option handling and live total in the CTA
- [ ] Cart sold-out blocking behaviour
- [ ] Single-page checkout with visible quote expiry
- [ ] Payment method presentation and the processing screen
- [ ] Branch confirmation SLA countdown and auto-refund messaging
- [ ] Tracking map + timeline split
- [ ] Mobile home "Order again" priority
- [ ] Mobile menu row layout over card grid
- [ ] Admin dashboard attention panel and inline queue actions
- [ ] Admin orders drawer pattern and reject-with-reason dialog
