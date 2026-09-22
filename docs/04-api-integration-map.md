# API Integration Map — NestJS Backend

---

## 1. System topology

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Next.js web │   │  Expo mobile │   │ Next.js admin│
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │  HTTPS + Supabase JWT (Bearer)      │
       └──────────────┬──────────────────────┘
                      ▼
        ┌─────────────────────────────┐
        │   NestJS API  (api.bangga)  │
        │   guards · validation ·     │
        │   state machine · idempotency│
        └───┬─────────┬──────────┬────┘
            │         │          │
   service-role│   secret keys│  secret keys
            ▼         ▼          ▼
   ┌──────────────┐ ┌─────────┐ ┌──────────┐
   │   Supabase   │ │ Payment │ │ Lalamove │
   │ PG · Auth ·  │ │ gateway │ │   API    │
   │ Storage · RT │ └────┬────┘ └────┬─────┘
   └──────────────┘      │ webhooks  │ webhooks
            ▲            └───────────┴──▶ /webhooks/* (signature verified)
            │
     Realtime subscriptions (read-only) ──▶ clients
```

Clients talk to Supabase **directly only for**: auth (sign in / up / refresh),
reading public catalogue data through RLS-protected views, reading their own
order rows, Realtime subscriptions, and uploading avatars. Every write that
touches money, order state, delivery or inventory goes to NestJS.

---

## 2. Module map

| NestJS module | Owns | Talks to |
|---|---|---|
| `AuthModule` | JWT verification, role + branch claims, guards | Supabase Auth (JWKS) |
| `UsersModule` | Profiles, addresses, notification prefs | Supabase PG |
| `BranchesModule` | Branches, hours, radius, open/closed, eligibility | Supabase PG |
| `MenuModule` | Categories, products, option groups, branch pricing | Supabase PG + Storage |
| `InventoryModule` | Branch availability, sold-out toggles, low-stock alerts | Supabase PG |
| `CartModule` | Cart validation, pricing, promotion evaluation | Supabase PG |
| `OrdersModule` | Order creation, state machine, confirmation, SLA jobs | Supabase PG + Realtime |
| `PaymentsModule` | Sessions, QR, webhooks, idempotency, reconciliation | Payment gateway |
| `RefundsModule` | Refund requests, reversals, manual-refund alerts | Payment gateway |
| `DeliveryModule` | Quotations, bookings, tracking, delivery webhooks | Lalamove |
| `PromotionsModule` | Promotions, vouchers, eligibility, redemption counts | Supabase PG |
| `NotificationsModule` | Push (Expo), email, in-app records | Expo Push, email provider |
| `AdminModule` | Admin/staff CRUD, roles, branch assignment, settings | Supabase PG |
| `ReportsModule` | Aggregations, exports | Supabase PG (read replica) |
| `AuditModule` | Append-only actor/action/entity log | Supabase PG |

Cross-cutting: global `ZodValidationPipe` (schemas from `packages/validation`),
`IdempotencyInterceptor`, `RateLimitGuard`, `AuditInterceptor`, structured
request logging with a correlation ID propagated to every outbound call.

---

## 3. Endpoints by surface

### Public / customer

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/branches` | none | List with open/closed computed server-side |
| POST | `/branches/eligibility` | none | `{ lat, lng }` → eligible branches, distance, fulfilment modes |
| GET | `/menu?branchId=` | none | Categories + products + branch price + availability |
| GET | `/menu/products/:id?branchId=` | none | Detail with option groups |
| GET | `/menu/search?q=&branchId=` | none | Search + filters |
| GET | `/promotions?branchId=` | none | Active, branch-scoped |
| POST | `/cart/validate` | optional | Revalidate items, prices, availability; returns diffs |
| POST | `/cart/quote` | optional | Subtotal, promotion, delivery fee, tax, total |
| POST | `/orders` | optional | Create order → `PENDING_PAYMENT`, returns order + guest token |
| GET | `/orders/:id` | owner or token | Full order |
| GET | `/orders/:id/receipt` | owner or token | Signed Storage URL |
| POST | `/orders/:id/cancel` | owner | Allowed only while `PENDING_PAYMENT` |
| POST | `/orders/track` | none | `{ code, phone }` → signed token |
| POST | `/payments/session` | owner or token | Card session / hosted checkout |
| POST | `/payments/duitnow-qr` | owner or token | Dynamic QR + expiry |
| GET | `/payments/:id/status` | owner or token | Polling fallback |
| POST | `/delivery/quotation` | owner or token | Lalamove quote, cached with TTL |
| GET | `/me`, `PATCH /me` | user | Profile |
| CRUD | `/me/addresses` | user | Saved addresses |
| GET | `/me/orders` | user | History + reorder payload |
| POST | `/me/orders/:id/reorder` | user | Returns a validated cart draft |
| POST | `/me/devices` | user | Register Expo push token |

### Admin

| Method | Route | Role |
|---|---|---|
| GET | `/admin/dashboard` | any admin (branch-scoped) |
| GET | `/admin/orders` | any admin |
| POST | `/admin/orders/:id/accept` | manager, staff |
| POST | `/admin/orders/:id/reject` | manager, staff — reason required |
| POST | `/admin/orders/:id/status` | manager, staff, kitchen — validated transition |
| POST | `/admin/orders/:id/delivery/quote` | manager, staff |
| POST | `/admin/orders/:id/delivery/book` | manager, staff |
| POST | `/admin/orders/:id/delivery/cancel` | manager |
| POST | `/admin/orders/:id/refund` | super admin, finance, manager ≤ limit |
| CRUD | `/admin/menu/*`, `/admin/categories/*`, `/admin/options/*` | super admin |
| PATCH | `/admin/inventory/:branchId/:productId` | manager, staff, kitchen |
| CRUD | `/admin/promotions/*` | super admin |
| GET | `/admin/payments`, `/admin/refunds` | finance, super admin |
| GET | `/admin/reports/*` | manager (own branch), finance, super admin |
| CRUD | `/admin/branches/*`, `/admin/users/*`, `/admin/settings/*` | super admin |
| GET | `/admin/audit-logs` | super admin, manager (own branch) |

### Webhooks (no user auth — signature verified)

| Route | Source | Behaviour |
|---|---|---|
| `POST /webhooks/payments` | Payment gateway | Verify HMAC signature → dedupe on event ID → advance `PENDING_PAYMENT → PAID → WAITING_FOR_BRANCH` |
| `POST /webhooks/refunds` | Payment gateway | Verify → `REFUND_PENDING → REFUNDED` |
| `POST /webhooks/delivery` | Lalamove | Verify → `LALAMOVE_BOOKED → RIDER_PICKED_UP → OUT_FOR_DELIVERY → DELIVERED`, or `FAILED` |

Every webhook is: signature-verified before the body is parsed as trusted,
idempotent via a unique index on `(provider, event_id)`, fast (persist the event,
process in a queue, return 200 quickly), and replay-safe. Unknown or
out-of-order events are stored and logged, never silently dropped.

---

## 4. Payment sequence

```
Client                NestJS                 Gateway              Supabase
  │  POST /orders        │                       │                    │
  │─────────────────────▶│ create order          │                    │
  │                      │──────────────────────────────────────────▶ │ PENDING_PAYMENT
  │  POST /payments/session                      │                    │
  │─────────────────────▶│ create session ──────▶│                    │
  │◀─── clientSecret/QR ─│◀───── session ────────│                    │
  │  pay (hosted fields / bank app / QR scan)   │                     │
  │─────────────────────────────────────────────▶│                    │
  │                      │◀── webhook (signed) ──│                    │
  │                      │ verify sig · dedupe · match order          │
  │                      │──────────────────────────────────────────▶ │ PAID
  │                      │──────────────────────────────────────────▶ │ WAITING_FOR_BRANCH
  │◀════ Supabase Realtime status change ════════════════════════════ │
```

**Guarantees the backend must provide**

1. Amount is recomputed server-side at session creation; the client-supplied
   total is never trusted.
2. One open payment session per order. A retry reuses or replaces the session —
   it never creates a second charge.
3. `(provider, event_id)` unique index makes duplicate webhooks a no-op.
4. Every gateway reference (`session_id`, `transaction_id`, `qr_id`) is persisted
   with its raw payload for reconciliation.
5. A scheduled reconciliation job queries the gateway for any order stuck in
   `PENDING_PAYMENT` for more than 15 minutes and resolves it.
6. All payment and refund mutations append to `audit_logs`.

---

## 5. Refund sequence

```
Trigger: branch reject · SLA timeout · delivery failure · admin action
   ↓
RefundsModule → order → REFUND_PENDING, refund row created
   ↓
Gateway supports automated reversal?
   ├─ yes → POST reversal → webhook → REFUNDED (reference shown to customer)
   └─ no  → create admin alert "Manual refund required"
             → admin marks refunded with a bank reference
             → REFUNDED, audit entry recorded
```

Refund amounts are always computed server-side from the order, support partial
refunds at line-item level, and can never exceed the captured amount — enforced
by a database check constraint as well as service logic.

---

## 6. Delivery sequence (Lalamove)

```
Checkout   POST /delivery/quotation   → quote + fee + expiry (cached by
                                        branch + destination + service type)
Order paid & accepted
Admin      POST /admin/orders/:id/delivery/quote  → fresh quote
Admin      POST /admin/orders/:id/delivery/book   → booking, rider pending
Lalamove   webhook ASSIGNING_DRIVER → ON_GOING → PICKED_UP → COMPLETED
           mapped to LALAMOVE_BOOKED → RIDER_PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
Failures   EXPIRED / CANCELED / REJECTED → order FAILED + admin alert
           → rebook, convert to pickup, or refund
```

Stored per order: quotation ID and expiry, booking/order ID, share/tracking URL,
rider name, phone and plate, status history with timestamps, and proof of
delivery (photo/signature URL) when the provider returns one. Quotations are
re-validated before booking; a stale quote is re-quoted rather than booked blind.

The customer's live map reads rider coordinates from our backend, which polls or
receives them from Lalamove — the Lalamove key is never in a client bundle.

---

## 7. Realtime

| Channel | Who subscribes | Payload |
|---|---|---|
| `order:{id}` | Customer (owner or token holder) | Status, timestamps, rider info |
| `branch:{id}:orders` | Admin clients for that branch | New orders, status changes |
| `branch:{id}:inventory` | Admin + customer menu views | Availability flips |

Realtime is **read-only and advisory**. Every screen that uses it also has a
polling fallback and a manual refresh, because a dropped socket must never leave
an operator looking at a stale queue.

---

## 8. Client integration rules

- All clients use one generated typed SDK (`packages/api-client`) built from the
  NestJS OpenAPI schema. No hand-written `fetch` in app code.
- Requests carry `Authorization: Bearer <supabase jwt>` and
  `X-Request-Id`; mutating requests carry `Idempotency-Key`.
- Server errors use a single envelope: `{ code, message, details?, requestId }`.
  `code` drives UI behaviour; `message` is safe to display; `requestId` is shown
  in the error state so support can trace it.
- Retries: GET requests retry with exponential backoff; mutations retry only with
  the same idempotency key.
- Mobile queues mutations made while offline and replays them on reconnect, except
  payment, which always requires a live connection.

### Environment variables

| Key | web | mobile | admin | api |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL` | yes | yes | yes | yes |
| `*_SUPABASE_ANON_KEY` | yes | yes | yes | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | **no** | **no** | yes |
| `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` | **no** | **no** | **no** | yes |
| `LALAMOVE_API_KEY`, `LALAMOVE_API_SECRET` | **no** | **no** | **no** | yes |
| `MAPS_API_KEY` (referrer-restricted, maps only) | yes | yes | yes | — |
| `EXPO_PUSH_ACCESS_TOKEN`, `EMAIL_API_KEY` | **no** | **no** | **no** | yes |

A CI check fails the build if any key on the "no" rows appears in a client bundle.
