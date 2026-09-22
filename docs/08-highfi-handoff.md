# 08 · High-fidelity handoff

Phase 2 deliverable: the high-fidelity user interface and the clickable prototype. This
document is the written companion to the two pages that carry the same information in
live form:

- `/design-system` — tokens, components, status vocabulary, accessibility commitments
- `/prototype` — screen index, simulated states, component inventory, outstanding assets

## What was built

A single Next.js application hosts all four platform views, so the whole product can be
reviewed by clicking through one URL:

| View | Route prefix | Notes |
| --- | --- | --- |
| Customer website | `/` | Responsive across 1440, 1024 and 390 frames |
| Mobile applications | `/mobile` | iOS and Android screens in true-size device frames |
| Admin console | `/admin` | Laptop-first at 1280, works to 1440 |
| Documentation | `/design-system`, `/prototype` | Rendered from the same live components |

The mobile screens are designed in device frames rather than in Expo for this phase, so
every platform difference can be seen side by side in a browser during review. The Expo
project consumes the same tokens from `src/lib/tokens.ts` when implementation starts.

## Run it

```
npm install
npm run dev
```

Then open `/prototype` and use the floating prototype panel, bottom right, to switch the
simulated outcomes: card result, DuitNow QR result, branch response, rider availability,
offline mode, reduced motion, signed-in state, and a fast-forward for every timer.

## The boundary of this build

This is user interface only. There is no backend, no Supabase project, no authentication,
no payment integration and no deployment. State lives in a React context and is mirrored
into browser local storage so a demonstration survives a refresh.

No secret, key or credential exists anywhere in the repository. Where a provider key would
appear in the admin settings screen, the field shows a masked placeholder and is labelled
as such.

The full statement of what is simulated is rendered on `/prototype`, sourced from
`src/lib/screen-index.ts`, so it cannot drift away from the prototype itself.

## Design decisions worth recording

**Motion is split by intent.** Scroll reveals and 2.5D parallax belong to the homepage and
the story page. From the menu onwards the interface is flat and fast, because content that
fades in is content that cannot be scanned. The 2.5D effect is layered images on a CSS
perspective with `data-depth` attributes, paused by an IntersectionObserver when off
screen, and never started at all under reduced motion.

**Branch is a dimension, not a page.** Availability, hours, fees, minimums, preparation
time and menu scope are all per branch. Two branches are live and a third can be added as
data. The branch selector shows a recommendation, live open or closed status, hours,
availability and a warning before a switch discards incompatible cart lines.

**Money is never ambiguous.** Sixteen payment states are designed, including the three
that usually go missing: a duplicate attempt, a delayed provider confirmation, and an
expired dynamic QR. Every one of them states plainly whether the customer has been
charged. Retrying always reuses the same order, so two orders can never result from one
intent.

**Status has one source.** `src/lib/status.ts` holds the order, payment and availability
metadata plus the legal transitions. The customer wording, the staff wording, the colour
and the icon all come from the same record, and the admin console only offers transitions
the state machine allows.

**Placeholders are designed, not broken.** Dish imagery renders a deterministic
illustrated placeholder derived from the dish name, so layouts are reviewed at final
density. Swapping in photography is a change to the asset manifest in
`src/components/ui/media.tsx`.

## Accessibility

Targeting WCAG 2.2 AA. The specific commitments, and where each one can be observed, are
tabulated on `/design-system#a11y`. The contrast section computes every ratio from the hex
values at render time rather than asserting them, so the documentation cannot claim a
passing ratio the palette does not actually have.

## Outstanding assets

Ten items, tabulated with priority on `/prototype#assets-h`. The ones with lead times and
therefore worth commissioning immediately are dish photography, final logo files, halal
certification artwork and numbers, reviewed legal copy, and the provider integration
contracts for Maybank, OXPay and Lalamove.

## Next phase

1. Approve the high-fidelity screens and the copy.
2. Commission the high-priority assets.
3. Stand up the Supabase schema and row-level security from `docs/05-database-entities.md`.
4. Build the NestJS API surface from `docs/04-api-integration-map.md`, with the payment
   and courier integrations server-side only.
5. Implement the Expo applications against the approved frames and the shared tokens.
