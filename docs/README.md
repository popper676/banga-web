# BANG GA BANG GA — Design & Architecture Documentation

Phase 1 (structure). Read in order.

| Doc | Covers | Output requirement |
|---|---|---|
| [00-foundation.md](./00-foundation.md) | Stack, repo shape, brand, colour, typography, motion & 3D policy, security boundary, responsive frames | 8, 14, 15 |
| [01-information-architecture.md](./01-information-architecture.md) | Content model, global IA, website sitemap, homepage scroll structure, mobile app navigation, admin navigation, role matrix | 1, 3, 4, 5 |
| [02-customer-ordering-flow.md](./02-customer-ordering-flow.md) | The 18-step ordering flow, order state machine, edge cases, guest vs. account, reorder, notifications | 2 |
| [03-lofi-wireframes.md](./03-lofi-wireframes.md) | Low-fidelity wireframes for the 12 priority screens with rationale, responsive behaviour and states | 6 |
| [04-api-integration-map.md](./04-api-integration-map.md) | NestJS modules, endpoints, payment/refund/delivery sequences, webhooks, realtime, env-var boundary | 11 |
| [05-database-entities.md](./05-database-entities.md) | Supabase entity model, table definitions, RLS matrix, indexes, storage buckets | 12 |
| [06-component-inventory.md](./06-component-inventory.md) | Design tokens, full component inventory with prop contracts and behaviour, shared core logic | 10, 16 |
| [07-states-and-accessibility.md](./07-states-and-accessibility.md) | Loading / empty / error / offline states, WCAG 2.2 AA notes, responsive behaviour tables, performance budgets | 13, 14, 15 |

An interactive review artifact for the wireframes, ordering flow and state machine lives in
the workspace canvases folder as `bangga-lofi-wireframes.canvas.tsx`.

## Not started yet (deliberately)

High-fidelity responsive screens (output 7), the visual layer of the design system (8) and
the clickable prototype (9) begin only after the ordering flow and responsive layouts in
docs 02 and 03 are approved. The approval checklist is at the end of
[03-lofi-wireframes.md](./03-lofi-wireframes.md).
