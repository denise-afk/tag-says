# TAG SAYS.

**Your tag says where you live. You say who you are.**

A standalone, production-quality Next.js storefront for TAG SAYS. — a
customizable bumper sticker brand. The core experience is the **Create
Your Tag** builder: pick a license plate state, type an identity, and see
a live, true-to-print sticker preview update instantly.

This is an independent web app (not a Shopify theme). It's built so
payments (Stripe) and print fulfillment (Printify) can be wired in later
without restructuring anything.

---

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Client-side cart persisted to `localStorage` (no backend database yet)
- Zero external UI libraries — everything is hand-built to match the
  brand's minimal black-and-white system

## Getting started locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The most important page to check first is
`/create`.

Copy `.env.example` to `.env.local` and fill in real values when you're
ready to connect payments/fulfillment — the app runs fine locally with
none of them set (checkout and fulfillment routes simply return a clear
"not configured" error instead of faking success).

```bash
cp .env.example .env.local
```

## Project structure

```
app/
  page.tsx                 Homepage (hero, how it works, examples, about, FAQ)
  create/page.tsx           /create — the Tag Builder page
  cart/page.tsx              /cart
  checkout/page.tsx          /checkout confirmation shell
  how-it-works/, about/, faq/, privacy/, terms/
  api/checkout/route.ts       POST — creates a Stripe Checkout session (placeholder)
  api/fulfillment/printify/   POST — submits a print order to Printify (placeholder)
components/
  StickerPreview.tsx         Renders the actual sticker face (used everywhere)
  TagBuilder.tsx              The interactive two-field builder + live preview + add-to-cart
  Header.tsx, Footer.tsx, Hero.tsx, HowItWorks.tsx, ExamplesSection.tsx,
  AboutSection.tsx, SocialProofSection.tsx, FaqAccordion.tsx, FaqSection.tsx
context/
  CartContext.tsx             Cart state + localStorage persistence
lib/
  types.ts                    Shared TypeScript types
  states.ts                   All 50 states + Washington, D.C.
  constants.ts                 Site copy, pricing placeholder, FAQ content, examples
  sticker.ts                  Input sanitization, uppercase formatting, dynamic scaling
  stripe.ts                   Payment integration architecture (not yet connected)
  printify.ts                 Fulfillment integration architecture (not yet connected)
```

## How the builder works

1. `TagBuilder.tsx` holds `tagState` and `identity` in React state.
2. Every keystroke runs through `sanitizeIdentityInput()` (strips tags,
   control characters, collapses whitespace) and `clampIdentityLength()`
   (hard character limit, currently 24 — see `IDENTITY_MAX_LENGTH` in
   `lib/constants.ts`).
3. `StickerPreview` re-renders instantly from that state — no page
   refresh, no server round-trip. Text is upper-cased only in the visual
   render; the underlying input keeps whatever casing the customer typed.
4. Long identity lines shrink automatically (`identityScaleFactor()` in
   `lib/sticker.ts`) so the sticker never overflows or wraps badly.
5. On **Add My Tag**, the current customization + quantity + exact
   rendered wording are saved as one `CartLineItem` in `CartContext`.
   Every add creates a *new* line item — two different customizations
   never merge, even if a customer later creates a duplicate.

## Cart persistence

The cart is stored in `localStorage` under the key `tagsays:cart:v1` so a
refresh doesn't lose a customer's in-progress order. There's no server
database yet — when you're ready to persist orders server-side (e.g. for
order history or fulfillment tracking), that's a natural next step.

## Connecting payments (Stripe)

1. Set `STRIPE_SECRET_KEY` in your environment.
2. Implement `createCheckoutSession()` in `lib/stripe.ts` using the
   Stripe SDK (`stripe.checkout.sessions.create`), building Stripe line
   items from the `CartLineItem[]` passed in.
3. `app/api/checkout/route.ts` already calls this and redirects the
   customer to the returned Checkout URL — no other wiring needed.
4. Add a webhook handler (not included) to confirm payment and trigger
   fulfillment — that's the right place to call
   `submitFulfillmentOrder()` from `lib/printify.ts`.

## Connecting fulfillment (Printify)

1. Set `PRINTIFY_API_KEY` and `PRINTIFY_SHOP_ID`.
2. Implement `generatePrintReadyFile()` in `lib/printify.ts` to render
   the sticker layout at the required print spec:
   **3371 × 971 px @ 300 DPI**, PNG/JPG/SVG. The simplest approach is an
   SVG template mirroring `StickerPreview`'s layout, rendered server-side.
3. Implement `submitFulfillmentOrder()` to POST the file + shipping
   address to Printify's Orders API
   (`POST /v1/shops/{shop_id}/orders.json`).
4. Add a webhook or polling handler for `getFulfillmentStatus()` to keep
   order status/tracking up to date.

Never call any Printify or Stripe function from client components — they
must only run in API routes / server code, where the secret keys live.

## Sticker sizes

TAG SAYS. offers three physical sizes, matching the Printify catalog
exactly:

| Size | Inches | Pixels @ 300 DPI | Placeholder price |
|---|---|---|---|
| Compact | 7.5" × 3.75" | 2250 × 1125 px | $7.00 |
| Classic | 11" × 3" | 3300 × 900 px | $9.00 |
| Wide | 15" × 3.75" | 4500 × 1125 px | $12.00 |

All three live in one place — `SIZE_OPTIONS` in `lib/constants.ts`. The
live preview's proportions (`StickerPreview.tsx`), the builder's size
picker, cart pricing, and the print-file dimensions sent to Printify
(`getPrintSpec()` in `lib/printify.ts`) all derive from that single list,
so adding, removing, resizing, or repricing a size only ever requires
editing `SIZE_OPTIONS` — nothing else needs to change.

## Configuring pricing & copy

Everything else customer-facing lives in `lib/constants.ts`: FAQ
answers, example tags, and hero/site copy. Change values there — no
component edits needed.

## Deployment

Deploys cleanly to Vercel:

```bash
npm run build
```

Then push to a Git repo and import it in Vercel, or run `vercel` from the
project root. Set the same environment variables from `.env.example` in
your hosting provider's dashboard before enabling checkout.

## What's intentionally not built yet

- Real Stripe/Printify network calls (architecture is in place; see
  above)
- Server-side order storage / order history
- Real customer photos in the "Spotted in the Wild" section (clearly
  marked placeholders only — no fake testimonials)
- Newsletter signup only stores an email in local component state; wire
  `NEWSLETTER_API_KEY` up to your provider of choice in `Footer.tsx`
