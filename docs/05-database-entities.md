# Database Entity Overview — Supabase / PostgreSQL

Conceptual model plus the security posture. Column lists are indicative, not the
final migration.

---

## 1. Entity relationship overview

```
                       ┌──────────────┐
                       │ auth.users   │  (Supabase Auth)
                       └──────┬───────┘
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  profiles    │ │ admin_users  │ │   devices    │
      └──────┬───────┘ └──────┬───────┘ └──────────────┘
             │                │ branch_id (nullable = all branches)
             ▼                ▼
      ┌──────────────┐ ┌──────────────┐
      │  addresses   │ │   branches   │◀──────────────┐
      └──────┬───────┘ └──────┬───────┘               │
             │                │                       │
             │        ┌───────┴────────┬──────────────┴──┐
             │        ▼                ▼                 ▼
             │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
             │ │branch_hours  │ │branch_products│ │branch_inventory│
             │ └──────────────┘ └──────┬───────┘ └──────┬───────┘
             │                         │                │
             │                  ┌──────┴────────────────┘
             │                  ▼
             │           ┌──────────────┐     ┌──────────────┐
             │           │  products    │────▶│  categories  │
             │           └──────┬───────┘     └──────────────┘
             │                  ▼
             │           ┌──────────────┐     ┌──────────────┐
             │           │option_groups │────▶│   options    │
             │           └──────────────┘     └──────────────┘
             │
             ▼
      ┌──────────────┐        ┌──────────────┐     ┌──────────────┐
      │   orders     │───────▶│ order_items  │────▶│order_item_   │
      │              │        │              │     │   options    │
      └──┬───┬───┬───┘        └──────────────┘     └──────────────┘
         │   │   │
         │   │   └────▶ ┌──────────────┐   ┌──────────────┐
         │   │          │  payments    │──▶│   refunds    │
         │   │          └──────────────┘   └──────────────┘
         │   └────────▶ ┌──────────────┐
         │              │  deliveries  │──▶ delivery_events
         │              └──────────────┘
         └────────────▶ ┌──────────────┐   ┌──────────────┐
                        │order_status_ │   │order_promotions│
                        │   history    │   └──────┬───────┘
                        └──────────────┘          ▼
                                           ┌──────────────┐  ┌──────────────┐
                                           │ promotions   │─▶│   vouchers   │
                                           └──────────────┘  └──────┬───────┘
                                                                    ▼
                                                        ┌────────────────────┐
                                                        │ voucher_redemptions│
                                                        └────────────────────┘

  Cross-cutting: notifications · webhook_events · audit_logs · settings
```

---

## 2. Core tables

### Identity

| Table | Key columns |
|---|---|
| `profiles` | `id → auth.users`, `full_name`, `phone`, `email`, `locale`, `marketing_opt_in`, `created_at` |
| `addresses` | `id`, `user_id`, `label`, `line1`, `line2`, `city`, `state`, `postcode`, `lat`, `lng`, `notes`, `is_default` |
| `admin_users` | `id → auth.users`, `role` (`super_admin`/`branch_manager`/`branch_staff`/`kitchen`/`finance`), `branch_id` (null = all), `is_active` |
| `devices` | `id`, `user_id`, `expo_push_token`, `platform`, `last_seen_at` |

### Branches

| Table | Key columns |
|---|---|
| `branches` | `id`, `name`, `slug`, `address`, `lat`, `lng`, `phone`, `delivery_radius_km`, `supports_dine_in/pickup/delivery`, `is_active`, `prep_time_minutes`, `confirmation_sla_seconds` |
| `branch_hours` | `id`, `branch_id`, `day_of_week`, `opens_at`, `closes_at`, `is_closed` |
| `branch_closures` | `id`, `branch_id`, `starts_at`, `ends_at`, `reason` — holidays and ad-hoc closures |

Open/closed is **computed** from hours + closures in Asia/Kuala_Lumpur, never
stored as a boolean that someone forgets to flip.

### Catalogue

| Table | Key columns |
|---|---|
| `categories` | `id`, `name`, `slug`, `sort_order`, `image_path`, `is_active` |
| `products` | `id`, `category_id`, `name`, `slug`, `description`, `base_price_cents`, `images[]`, `is_muslim_friendly`, `spice_level`, `allergens[]`, `tags[]`, `is_active` |
| `option_groups` | `id`, `product_id`, `name`, `min_select`, `max_select`, `is_required`, `sort_order` |
| `options` | `id`, `option_group_id`, `name`, `price_delta_cents`, `is_active`, `sort_order` |
| `branch_products` | `branch_id`, `product_id`, `price_override_cents`, `is_listed` — per-branch pricing and visibility |
| `branch_inventory` | `branch_id`, `product_id`, `availability` (`available`/`low`/`sold_out`), `auto_reset_daily`, `updated_at`, `updated_by` |

Money is stored in **integer cents** everywhere. `numeric`/`float` for currency is
banned; the migration includes a check constraint on every `*_cents` column.

### Orders

| Table | Key columns |
|---|---|
| `orders` | `id`, `code` (human `BG-YYMMDD-NNNN`), `user_id` (nullable for guests), `guest_name/phone/email`, `branch_id`, `fulfilment_type`, `address_id` or snapshot, `status` (enum), `subtotal_cents`, `discount_cents`, `delivery_fee_cents`, `tax_cents`, `total_cents`, `customer_notes`, `placed_at`, `confirmed_at`, `ready_at`, `completed_at`, `rejection_reason` |
| `order_items` | `id`, `order_id`, `product_id`, `name_snapshot`, `unit_price_cents`, `quantity`, `notes`, `line_total_cents` |
| `order_item_options` | `id`, `order_item_id`, `option_id`, `name_snapshot`, `price_delta_cents` |
| `order_status_history` | `id`, `order_id`, `from_status`, `to_status`, `actor_type`, `actor_id`, `reason`, `created_at` |

Orders snapshot names and prices at purchase time. Changing a menu price next week
must never rewrite last week's receipt.

### Money

| Table | Key columns |
|---|---|
| `payments` | `id`, `order_id`, `provider`, `method` (`card`/`duitnow_qr`), `status`, `amount_cents`, `currency`, `session_id`, `transaction_id`, `qr_payload`, `qr_expires_at`, `raw_payload` (jsonb), `paid_at` |
| `refunds` | `id`, `order_id`, `payment_id`, `amount_cents`, `reason`, `status`, `is_manual`, `provider_reference`, `manual_reference`, `requested_by`, `processed_at` |
| `webhook_events` | `id`, `provider`, `event_id`, `event_type`, `signature_valid`, `payload` (jsonb), `processed_at`, `processing_error` — **unique `(provider, event_id)`** |

### Delivery

| Table | Key columns |
|---|---|
| `deliveries` | `id`, `order_id`, `provider`, `quotation_id`, `quotation_expires_at`, `booking_id`, `fee_cents`, `status`, `rider_name`, `rider_phone`, `rider_plate`, `tracking_url`, `proof_url`, `booked_at`, `delivered_at`, `failure_reason` |
| `delivery_events` | `id`, `delivery_id`, `provider_status`, `mapped_status`, `payload` (jsonb), `occurred_at` |

### Marketing

| Table | Key columns |
|---|---|
| `promotions` | `id`, `name`, `type` (`percentage`/`fixed`/`free_delivery`/`bundle`), `value`, `min_spend_cents`, `branch_ids[]`, `product_ids[]`, `starts_at`, `ends_at`, `badge_label`, `is_active` |
| `vouchers` | `id`, `promotion_id`, `code`, `max_redemptions`, `max_per_user`, `redemption_count`, `expires_at` |
| `voucher_redemptions` | `id`, `voucher_id`, `order_id`, `user_id`, `redeemed_at` — unique `(voucher_id, order_id)` |
| `notifications` | `id`, `user_id`, `order_id`, `type`, `title`, `body`, `channel`, `read_at`, `sent_at` |

### Operations

| Table | Key columns |
|---|---|
| `audit_logs` | `id`, `actor_type`, `actor_id`, `action`, `entity_type`, `entity_id`, `before` (jsonb), `after` (jsonb), `ip`, `user_agent`, `created_at` — append-only, no UPDATE or DELETE grant to anyone |
| `settings` | `key`, `value` (jsonb), `updated_by`, `updated_at` — tax rate, service charge, SLA, feature flags |

---

## 3. Row Level Security matrix

RLS is enabled on **every** table. The service role bypasses RLS and is used only
by NestJS; the anon and authenticated roles get narrowly scoped policies.

| Table | anon | authenticated (customer) | admin (via `admin_users`) | service role |
|---|---|---|---|---|
| `branches`, `branch_hours` | SELECT active | SELECT active | SELECT all; UPDATE own branch (manager+) | ALL |
| `categories`, `products`, `option_groups`, `options` | SELECT active | SELECT active | SELECT all; write super_admin | ALL |
| `branch_products`, `branch_inventory` | SELECT listed | SELECT listed | SELECT own branch; UPDATE availability own branch | ALL |
| `profiles` | — | SELECT/UPDATE own row | SELECT (support scope) | ALL |
| `addresses` | — | ALL own rows | SELECT for own-branch orders | ALL |
| `orders` | — | SELECT own rows only | SELECT own branch | ALL |
| `order_items`, `order_item_options`, `order_status_history` | — | SELECT via own order | SELECT via own-branch order | ALL |
| `payments`, `refunds` | — | SELECT limited columns via own order | SELECT own branch; finance all | ALL |
| `deliveries`, `delivery_events` | — | SELECT limited columns via own order | SELECT own branch | ALL |
| `promotions`, `vouchers` | SELECT active public | SELECT active public | SELECT all; write super_admin | ALL |
| `voucher_redemptions` | — | SELECT own | SELECT own branch | ALL |
| `notifications` | — | SELECT/UPDATE `read_at` own | — | ALL |
| `webhook_events`, `audit_logs`, `settings` | — | — | SELECT audit (scoped) | ALL (audit: INSERT only) |

**No client role has INSERT or UPDATE on `orders`, `payments`, `refunds`,
`deliveries`, `webhook_events` or `audit_logs`.** Order creation happens through
`POST /orders`, not a direct insert, so the state machine, pricing and promotion
rules are always enforced in one place.

Additional hardening:

- A `BEFORE UPDATE` trigger on `orders` rejects any status transition not present
  in the allowed-transition table, even for the service role. The state machine is
  enforced in the database, not only in TypeScript.
- Column-level grants hide `raw_payload`, `qr_payload` and provider references
  from customer-facing views; customers read orders through a
  `v_customer_orders` view rather than the base table.
- Guest access uses a short-lived signed token verified by the backend; guests
  never receive a Supabase session with broad read rights.
- `updated_at` maintained by trigger; all timestamps are `timestamptz` stored in
  UTC and rendered in Asia/Kuala_Lumpur.

---

## 4. Indexes that matter

```sql
create index on orders (branch_id, status, placed_at desc);   -- admin queue
create index on orders (user_id, placed_at desc);             -- order history
create unique index on orders (code);                         -- lookup by code
create index on order_items (order_id);
create index on branch_inventory (branch_id, availability);   -- sold-out filter
create unique index on webhook_events (provider, event_id);   -- idempotency
create index on audit_logs (entity_type, entity_id, created_at desc);
create index on branches using gist (ll_to_earth(lat, lng));  -- nearest branch
```

Products get a `tsvector` column over name + description + tags for search,
refreshed by trigger.

---

## 5. Storage buckets

| Bucket | Public | Contents | Policy |
|---|---|---|---|
| `menu-images` | yes (CDN) | Product and category imagery | Public read; write super_admin only |
| `brand-assets` | yes | Marketing imagery, 3D posters, GLB models | Public read; write super_admin only |
| `receipts` | no | Generated order PDFs | Signed URLs issued by the backend, 15-minute TTL |
| `branch-documents` | no | Licences, halal certification, compliance | Signed URLs, super_admin only |
| `proof-of-delivery` | no | Rider photos and signatures | Signed URLs; readable by the order owner and own-branch admins |
| `avatars` | no | Profile photos | Owner read/write via RLS path prefix `{user_id}/` |

Images are served as WebP/AVIF through the Supabase image transform, with size
variants for card, detail and hero usage so mobile never downloads a hero-sized
asset for a list thumbnail.
