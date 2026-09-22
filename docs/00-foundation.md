# BANG GA BANG GA — Product Foundation

> **Phase gate.** This document set covers Phase 1 (structure). Final visual styling,
> high-fidelity screens and production 3D assets are deliberately **not** started.
> They begin only after the customer ordering flow and responsive layouts in
> `02-customer-ordering-flow.md` and `03-lofi-wireframes.md` are approved.

---

## 1. What we are building

A single Korean-food ordering ecosystem for a two-branch, Muslim-friendly Korean
restaurant in Malaysia, made of six deployable parts:

| # | Surface | Stack | Primary job |
|---|---------|-------|-------------|
| 1 | Customer website | Next.js (App Router) + React + TypeScript | Brand storytelling **and** ordering |
| 2 | Customer mobile app | React Native + Expo + TypeScript | Fast repeat ordering, push notifications |
| 3 | Admin panel | Next.js + React + TypeScript, desktop-first | Branch operations, menu, payments, delivery |
| 4 | Backend API | Node.js + NestJS (modular monolith) | Single trusted authority for money and orders |
| 5 | Database / auth / storage | Supabase (PostgreSQL, GoTrue, Storage, Realtime) | Shared persistence and identity |
| 6 | Integrations | Payment gateway (Visa + DuitNow QR), Lalamove | Reached **only** through the backend |

Flutter is not used anywhere. The mobile app is React Native + Expo.

### Repository shape (pnpm workspace monorepo)

```
bangga/
├─ apps/
│  ├─ web/          Next.js customer website
│  ├─ mobile/       Expo React Native app
│  ├─ admin/        Next.js admin panel
│  └─ api/          NestJS backend
├─ packages/
│  ├─ core/         Domain types, order state machine, price/ cart maths
│  ├─ api-client/   Typed SDK generated from the NestJS OpenAPI schema
│  ├─ validation/   Zod schemas shared by client + server
│  ├─ tokens/       Design tokens (colour, type, spacing, radius, motion)
│  ├─ ui-web/       React DOM components (web + admin)
│  └─ ui-native/    React Native components (mobile)
├─ supabase/
│  ├─ migrations/   SQL migrations
│  └─ policies/     Row Level Security policies
└─ docs/            This folder
```

**Sharing rule.** Logic, types, validation and tokens are shared across all clients.
Layout is not. Web, iOS and Android each follow their own platform conventions —
identical pixel layouts across platforms is an anti-goal.

---

## 2. Brand

**Name (always in customer-facing copy):** BANG GA BANG GA

**Concept:** TRADITION & TRENDY
**Emotional line:** NICE TO MEET YOU. NOW, LET'S EAT.
**Secondary concept (photo booth):** MAKE IT LAST.

**Personality:** Korean, friendly, youthful, affordable, modern, playful, welcoming,
Muslim-friendly. Built for students, friends and families.

The brand carries two connected promises that must both be visible in the product:

1. Modern, affordable Korean dining (individual sets under RM20).
2. Photo booth memories after the meal (sessions from RM1).

### Voice

Short sentences. Warm, direct, never corporate. Invitational rather than salesy.
"Come hungry. Leave smiling." is the tonal reference point. Transactional copy
(checkout, payment, errors) drops the playfulness and becomes plain and precise —
nobody wants a joke while a payment is failing.

---

## 3. Colour system

| Token | Hex | Role |
|-------|-----|------|
| `brand.primary` | `#6EC7CE` | Primary brand teal — fills, illustration, large shapes |
| `brand.deepTeal` | `#1D5960` | Section blocking, dark surfaces, footer |
| `ink` | `#102A2E` | Primary text, darkest surface |
| `cream` | `#FFF7E8` | Default warm page background |
| `coral.soft` | `#CE756E` | Decorative accent, illustration |
| `coral.cta` | `#B9433B` | Primary call-to-action only |
| `yellow.warm` | `#F4C95D` | Promotion badges, highlights |
| `mint.soft` | `#DDF3EF` | Subtle section fills, selected states |
| `white` | `#FFFFFF` | Surfaces, cards |
| `grey.neutral` | `#66777A` | Secondary text, borders, disabled |

**Distribution target:** ~60% white + warm cream, ~30% teal + dark ink,
~10% coral + yellow accents. Accents are punctuation, not paragraphs.

### Accessibility rules (non-negotiable)

- Never place small white text on `#6EC7CE`. Use `#102A2E` on light teal.
- Use white text on `#1D5960` and `#102A2E` only.
- `coral.cta #B9433B` is used with white text at 4.5:1+; `coral.soft #CE756E` is
  decorative and never carries small text.
- All body text meets WCAG AA 4.5:1; large display text meets 3:1.
- Status is never communicated by colour alone — every status carries an icon
  **and** a text label (see `06-states-and-accessibility.md`).
- Focus rings are visible on every interactive element, 2px, offset 2px, using
  `ink` on light surfaces and `brand.primary` on dark surfaces.

---

## 4. Typography

Two families only.

| Role | Family | Usage |
|------|--------|-------|
| Display | Bold rounded geometric sans (candidates: Poppins SemiBold/Bold, Gilroy, Recoleta Rounded) | Hero headlines, section headings, brand statements, numbers in marketing |
| Text | Clean neutral sans (candidates: Inter, Pretendard) | Menu items, prices, forms, checkout, admin tables, order info |

Pretendard is the preferred text face because it covers Latin and Hangul with
matching metrics, which matters for Korean dish names.

Decorative fonts are never used for body content, prices, or anything in the
admin panel. Prices always use tabular numerals.

### Scale (web, 1440px baseline)

| Step | Size / line | Family | Use |
|------|-------------|--------|-----|
| Display XL | 96 / 96 | Display | Hero headline |
| Display L | 64 / 68 | Display | Section headings |
| Display M | 44 / 50 | Display | Sub-section |
| Heading | 28 / 36 | Display | Card group titles |
| Title | 20 / 28 | Text semibold | Food name, dialog title |
| Body | 16 / 26 | Text | Default copy |
| Small | 14 / 20 | Text | Meta, helper text |
| Caption | 12 / 16 | Text | Badges, table meta |

Mobile scales Display XL → 40 / 44 and Display L → 32 / 36. Body never goes
below 14px on any surface, and never below 16px on form inputs (iOS zoom).

---

## 5. Visual direction (for Phase 2)

Korean editorial: large confident typography, generous whitespace, warm food
photography on cream, soft rounded shapes (radius 8 / 16 / 24 / full), teal-cream-coral
colour blocking, subtle paper grain over flat fills, Korean-inspired geometric
accents, photo-strip motifs for the booth story.

**Explicitly avoided:** generic fast-food styling, neon, heavy glassmorphism,
overcrowded cards, gradient stacking, animation for its own sake, cartoonish
Korean stereotypes, and any motion that slows down ordering.

---

## 6. Motion and 3D policy

| Zone | Motion allowed |
|------|----------------|
| Marketing sections (hero, food identity, photo booth, closing) | React Three Fiber scenes, GSAP ScrollTrigger, Motion transitions |
| Menu browsing, cart, checkout, payment, tracking | Motion only — opacity/transform under 200ms. No 3D, no scroll hijacking |
| Admin panel | No 3D. Motion limited to state transitions and skeletons |

**Hard rules**

1. Menu and Order Now CTAs are interactive on first paint. 3D never gates them.
2. 3D is code-split and lazy-loaded behind an `IntersectionObserver`; the canvas
   renders a static WebP poster until the section is near the viewport.
3. `requestAnimationFrame` loops pause when the section leaves the viewport and
   when `document.visibilityState !== "visible"`.
4. GLB models are Draco-compressed, textures are KTX2/Basis, target < 800 KB per
   scene on desktop and < 400 KB on mobile; particle counts halve below 768px.
5. `prefers-reduced-motion: reduce` swaps all large movement for opacity-only
   transitions, freezes the 3D scene on a static frame, and disables the camera
   flash and any strobing in the photo booth section.
6. No effect may flash more than three times per second, ever.
7. Budget: Largest Contentful Paint < 2.5s and Interaction to Next Paint < 200ms
   on a mid-range Android (Moto G-class) over 4G. Verified before launch.

---

## 7. Security boundary (the single most important architectural rule)

The website and mobile app are **untrusted clients**. They hold only the Supabase
anon key and a user JWT.

Never shipped to a client bundle: the Supabase service-role key, payment gateway
secret keys, payment webhook signing secrets, Lalamove API key and secret.
These live in backend environment variables only.

Clients may **never** write these fields, at the database level, not just the UI:

- payment status, paid amount, transaction references
- refund status and refund amounts
- branch confirmation (accept / reject)
- order status beyond customer-initiated cancellation while `PENDING_PAYMENT`
- delivery status and proof of delivery
- protected inventory counts
- prices, promotion values, voucher redemption counts

Every one of these transitions goes through an authenticated NestJS endpoint that
writes with the service-role key after validating the actor's role, the branch
scope, and the legality of the state transition. Details in
`04-api-integration-map.md` and `05-database-entities.md`.

---

## 8. Responsive frames

| Surface | Frames |
|---------|--------|
| Website | 1440 desktop, 1024 tablet, 390 mobile |
| Mobile app | 393 × 852 (iOS), 360 × 800 (Android) |
| Admin | 1440 desktop, 1280 laptop |

Website grid: 12 columns / 80px margin / 24px gutter at 1440; 8 columns / 40 / 20
at 1024; 4 columns / 20 / 16 at 390. Spacing scale is 4-based:
4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

---

## 9. Definition of done for Phase 1 approval

- [ ] Ordering flow (18 steps) reviewed against real branch operations
- [ ] Order state machine agreed with the restaurant owner
- [ ] Low-fi wireframes approved for all 12 priority screens
- [ ] Responsive behaviour approved at 1440 / 1024 / 390
- [ ] API integration map reviewed by backend
- [ ] Database entities and RLS matrix reviewed by backend

Only then: high-fidelity screens, full design system visuals, 3D asset production,
interactive prototype.
