# Missing assets

This prototype is visually complete without the production files below. Placeholders live in `src/components/ui/media.tsx` (`FoodImage`, `MapView`, `PhotoStrip`, `QRCode`) and in the wordmark. The same list is rendered on `/prototype`.

| ID | Item | Need | Blocking | Current placeholder |
| --- | --- | --- | --- | --- |
| food-photography | Dish photography | One 4:3 hero and one 1:1 crop per menu item, shot on a warm neutral surface with consistent lighting and no on-image text. | high | `FoodImage` draws a deterministic illustrated placeholder from the dish name. |
| brand-logo | Final logo files | Wordmark and the 방가 mark as SVG, in full colour, single colour and reversed, plus a favicon set and app icons at every required iOS and Android size. | high | Wordmark set live in Poppins ExtraBold with a teal rounded mark. |
| branch-photography | Branch interior and exterior photography | Two to three images per branch, including the shopfront for wayfinding and the counter for pickup instructions. | medium | Illustrated scene placeholders in the locations cards. |
| maps | Real map tiles and geocoding | A map provider key, branch coordinates, delivery radius polygons and address autocomplete for Malaysian addresses. | medium | `MapView` renders an illustrated street grid with labelled pins. |
| halal-cert | Halal certification artwork and certificate numbers | The JAKIM certificate image and per-branch certificate numbers with expiry dates. | high | Text badge reading Halal certified, with placeholder copy. |
| legal-copy | Reviewed legal copy | Terms, privacy, refund and cookie policy reviewed against Malaysian consumer and PDPA requirements, plus business registration and SST numbers on receipts. | high | Draft copy that matches the prototype's actual rules. |
| photo-booth | Photo booth assets | Frame overlay artwork, sticker set and example strips. | low | `PhotoStrip` renders coloured frames in the correct proportions. |
| provider-docs | Provider integration details | Maybank card acquiring and OXPay DuitNow sandbox credentials, webhook schemas, settlement timings and the Lalamove quote/booking contracts. Server-side env vars only. | high | Reference formats modelled from public documentation. No key exists in this repository. |
| fonts | Licensed font files | Self-hosted Poppins and Inter subsets, including Latin Extended. | low | Loaded through `next/font` in the prototype. |
| copy-ms | Bahasa Malaysia translation | A full translation pass, including order status vocabulary and payment failure messages. | medium | English only, with a language switch present in system settings. |

Drop real files into `/public/images/…` and list their paths in `AVAILABLE_ASSETS` inside `src/components/ui/media.tsx`. `FoodImage` will then prefer the file over the illustration.
