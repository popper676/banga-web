# Customer Ordering Flow & Order State Machine

This is the document that needs approval before any high-fidelity design starts.
It describes what actually happens between "I'm hungry" and "here's your receipt",
including the parts that go wrong.

---

## 1. The happy path (18 steps)

```
 1  Open website or app
        ↓
 2  Enter or detect delivery location ─── permission denied? → manual address / postcode
        ↓
 3  Select nearest eligible branch ────── none in range? → switch to Pickup, or notify-me
        ↓
 4  Browse branch menu
        ↓
 5  Select a food item
        ↓
 6  Choose size, options, add-ons ─────── live price updates with every change
        ↓
 7  Add customer notes (free text, 200 chars, "no guarantee" helper)
        ↓
 8  Add to cart ──────────────────────── toast + cart count; stay on menu
        ↓
 9  Choose Pickup or Delivery
        ↓
10  Review branch, items, delivery fee, promotions, total
        ↓
11  Pay — Visa card or DuitNow QR
        ↓
12  Wait for branch confirmation (live)
        ↓
13  Accepted ─────────── or Rejected → automatic refund initiated
        ↓
14  Preparing → Ready
        ↓
15  Lalamove booked → rider assigned → tracking live      (delivery only)
        ↓
16  Delivery confirmed / order collected
        ↓
17  Order completed
        ↓
18  Receipt · order history · reorder
```

### Design intent at each decision point

**Step 2 — location.** Location is requested *contextually*, not on app launch. The
prompt appears when the user first taps "Order Now" or opens the menu, with a one
line explanation of why. Denial is a first-class path, not an error: the user types
an address or picks a saved one, and nothing is blocked.

**Step 3 — branch.** We compute eligibility from the delivery point: within the
branch's delivery radius, branch currently open, and fulfilment mode enabled. If
both branches are eligible we pick the nearest and say so ("Nearest: SS15 · 2.3 km"),
always with a visible way to change it. Switching branches after items are in the
cart triggers a confirmation dialog listing any item that is unavailable or priced
differently at the new branch, with the choice to keep what transfers.

**Step 6 — options.** Required groups are enforced before Add to Cart is enabled,
and the reason is shown inline ("Choose 1 sauce") rather than as a generic disabled
button. Price deltas are shown next to each option (`+RM3.00`), and the button label
carries the running total: `Add to cart · RM18.90`.

**Step 9 — fulfilment.** Pickup and Delivery are a segmented control at the top of
checkout, because the choice changes the fee, the ETA, and which fields are required.
Changing it mid-checkout re-quotes rather than silently keeping a stale fee.

**Step 10 — review.** The delivery fee is a real Lalamove quotation, not an estimate,
and it carries an expiry. If the quote expires while the user hesitates, we re-quote
in the background and, only if the price changed, show a non-blocking notice before
payment.

**Step 11 — payment.** Card uses the gateway's hosted fields / redirect so no PAN
touches our code. DuitNow QR shows a dynamic QR with a countdown and polls status.
On mobile we deep-link to the banking app where supported and fall back to QR.

**Step 12 — confirmation wait.** This is where customers get anxious, so the screen
is honest: it shows a countdown against the branch's response SLA (default 5 minutes),
the branch phone number, and what happens if nobody answers (auto-refund). Realtime
via Supabase, with polling fallback.

**Step 13 — rejection.** Rejection always names a reason from a fixed list
(item unavailable / branch too busy / outside hours / delivery not possible) and
immediately triggers a refund. The customer sees the refund reference and an expected
timeline, not just "sorry".

---

## 2. Order state machine

One enum, `OrderStatus`, defined in `packages/core` and mirrored as a PostgreSQL
enum. Transitions are enforced server-side; any illegal transition is rejected with
`409 Conflict` and written to the audit log.

| Status | Set by | Customer sees | Next legal states |
|---|---|---|---|
| `PENDING_PAYMENT` | Backend on order create | "Waiting for payment" | `PAID`, `FAILED`, `CANCELLED` |
| `PAID` | Payment webhook (verified) | "Payment received" | `WAITING_FOR_BRANCH` |
| `WAITING_FOR_BRANCH` | Backend, immediately after `PAID` | "Sending to the kitchen" | `ACCEPTED`, `REJECTED` |
| `ACCEPTED` | Branch staff | "Order confirmed" | `PREPARING` |
| `REJECTED` | Branch staff / SLA timeout | "Order declined" + reason | `REFUND_PENDING` |
| `PREPARING` | Kitchen | "Cooking now" | `READY` |
| `READY` | Kitchen | Pickup: "Ready for pickup" · Delivery: "Ready — finding a rider" | `LALAMOVE_BOOKED` (delivery), `COMPLETED` (pickup) |
| `LALAMOVE_BOOKED` | Staff via backend | "Rider on the way to the restaurant" | `RIDER_PICKED_UP`, `FAILED` |
| `RIDER_PICKED_UP` | Lalamove webhook | "Picked up" | `OUT_FOR_DELIVERY` |
| `OUT_FOR_DELIVERY` | Lalamove webhook | "Out for delivery" + live map | `DELIVERED`, `FAILED` |
| `DELIVERED` | Lalamove webhook | "Delivered" | `COMPLETED` |
| `COMPLETED` | Backend (auto, or staff for pickup) | "Enjoy!" + receipt + reorder | `REFUND_PENDING` |
| `REFUND_PENDING` | Backend / admin | "Refund in progress" | `REFUNDED`, `FAILED` |
| `REFUNDED` | Refund webhook / admin | "Refunded" + reference | terminal |
| `FAILED` | Backend | Contextual failure message + recovery action | `REFUND_PENDING`, `CANCELLED` |

```
PENDING_PAYMENT ──pay──▶ PAID ──▶ WAITING_FOR_BRANCH ──┬─accept─▶ ACCEPTED ─▶ PREPARING ─▶ READY
        │                                              │                                    │
        ├─timeout/fail─▶ FAILED                        └─reject─▶ REJECTED ─▶ REFUND_PENDING├─pickup──────────▶ COMPLETED
        └─user cancel──▶ CANCELLED                                              │           │
                                                                    REFUNDED ◀──┘           └─delivery─▶ LALAMOVE_BOOKED
                                                                                                              ↓
                                                              COMPLETED ◀── DELIVERED ◀── OUT_FOR_DELIVERY ◀── RIDER_PICKED_UP
```

**Customer-facing tracker** collapses these fifteen states into five visible steps —
Confirmed → Preparing → Ready → On the way → Delivered — with the detailed status as
supporting text underneath. Pickup orders show four steps and swap the last two for
"Ready for pickup" → "Collected". Admin always sees the full enum.

**Cancellation.** Customers can cancel only while `PENDING_PAYMENT`. After payment,
cancellation is a refund request routed to the branch, never a direct status write.

---

## 3. Edge cases and failure paths

These need explicit design before hi-fi, because each one is a screen state.

| Situation | System behaviour | What the customer sees |
|---|---|---|
| Item sells out while in cart | Cart revalidates on load, on branch change and at checkout entry | Inline "Sold out at SS15" on the line, disabled checkout, one-tap remove or swap |
| Branch closes during checkout | Re-check open hours at payment intent creation | Blocking dialog with next opening time and a switch-branch option |
| Address outside delivery radius | Eligibility check before fulfilment selection | "Too far for delivery from either branch" + Pickup offered + nearest branch distance |
| Lalamove quote expires | Background re-quote on a timer | Silent if unchanged; a clear "Delivery fee updated to RM X" notice if changed, before payment |
| Payment succeeds, app closes | Webhook is the source of truth, not the client | Order appears in history and push/email confirms; tracking link in the email |
| Payment gateway timeout | Order stays `PENDING_PAYMENT`; reconciliation job queries the gateway | "We're confirming your payment" with a retry that is idempotent, never a double charge |
| Duplicate webhook delivery | Idempotency key on gateway event ID; unique index rejects replays | Nothing — invisible by design |
| Branch never responds within SLA | Scheduled job auto-rejects at 5 min and initiates refund | "The branch couldn't confirm in time. Your refund is on the way." + reference |
| No rider found | Lalamove failure webhook → `FAILED` + admin alert | "We're finding another rider" then either rebooked, switched to pickup, or refunded |
| Delivery failed at door | Lalamove failure reason recorded, order → `FAILED` | Reason, branch contact, and a refund or redelivery choice |
| Automatic refund unsupported | Backend creates a manual-refund admin alert | "Refund approved — processed manually within 3–5 working days" + reference |
| Offline mid-order | Cart persists locally; mutations queue | Offline banner, cached menu, actions that need network are disabled with an explanation |
| Guest wants history | Order token stored in the browser / device | "Track order" by code + phone; prompt to create an account to keep history |

---

## 4. Guest vs. authenticated

Ordering never requires an account. Guest checkout captures name, phone and (for
delivery) address, then issues a signed order token so tracking and the receipt
work without login. After the order completes we offer a one-tap upgrade:
"Save this order to an account?" which links the existing order rows to the new user.

Authenticated users gain: saved addresses, order history and reorder, saved payment
references (tokenised at the gateway — we never store card data), vouchers, and push
notifications.

---

## 5. Reorder

From order history, "Reorder" rebuilds the cart from the historical line items,
then runs the same validation as a branch switch: unavailable items are flagged,
changed prices are shown as a diff, and the user confirms before landing on the cart.
It never silently substitutes or silently charges a different total.

---

## 6. Notification map

| Event | Web | Mobile | Email |
|---|---|---|---|
| Payment received | In-app | Push | Yes, with receipt |
| Order accepted | In-app + realtime tracker | Push | No |
| Order rejected | In-app + dialog | Push | Yes, with refund reference |
| Ready for pickup | In-app | Push | No |
| Rider assigned / out for delivery | Realtime tracker | Push | No |
| Delivered | In-app | Push | Yes, with receipt |
| Refund processed | In-app | Push | Yes, with reference |

All customer notification copy lives in one place in `packages/core` so web, mobile
and email stay in sync, and all of it is written for Malaysian English.
