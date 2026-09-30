/**
 * Payment integration (Stripe Checkout).
 *
 * Requires STRIPE_SECRET_KEY to be set server-side (in Vercel's
 * Environment Variables, never committed to the repo). Each cart line
 * item becomes its own Stripe line item, priced inline from the exact
 * customization/quantity/price the customer saw in their cart — nothing
 * here fakes or skips a real charge.
 */

import Stripe from "stripe";
import { CartLineItem } from "./types";
import { SIZE_OPTIONS, getSizeOption } from "./constants";
import { unitPriceCents } from "./pricing";

const MAX_QUANTITY_PER_LINE = 50;

export interface CheckoutSessionRequest {
  lineItems: CartLineItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your server " +
        "environment (Vercel Project Settings \u2192 Environment Variables)."
    );
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();

  // Never trust prices or quantities sent from the browser: validate
  // them here and price every tag from its size (plus the bundle deal).
  for (const item of request.lineItems) {
    if (!SIZE_OPTIONS.some((size) => size.id === item.customization?.sizeId)) {
      throw new Error("Unknown magnet size.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      throw new Error("Invalid quantity.");
    }
  }
  const totalQuantity = request.lineItems.reduce((sum, item) => sum + item.quantity, 0);

  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    request.lineItems.map((item) => {
      const sizeLabel = getSizeOption(item.customization.sizeId).label;
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitPriceCents(item.customization.sizeId, totalQuantity),
          product_data: {
            name: `${item.productName} \u2014 ${item.renderedLineOne} / ${item.renderedLineTwo}`,
            description: `Size: ${sizeLabel}`,
            // Order metadata Printify fulfillment will need later, kept
            // on the line item so it survives all the way to the paid
            // Checkout Session (see the webhook handler you'll add for
            // step 3 of fulfillment).
            metadata: {
              mode: item.customization.mode,
              lineOneRaw: item.customization.lineOneRaw,
              lineTwoRaw: item.customization.lineTwoRaw,
              sizeId: item.customization.sizeId,
            },
          },
        },
      };
    });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: stripeLineItems,
    success_url: request.successUrl,
    cancel_url: request.cancelUrl,
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    // Shows a "promotion code" field; create codes (e.g. FIRSTTAG) in the
    // Stripe Dashboard → Product catalog → Coupons — no code change needed.
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  return { sessionId: session.id, url: session.url };
}

/**
 * Looks up a finished Checkout Session so the success page can report the
 * real, paid order total (after bundle + promo codes) to the Meta Pixel.
 * Returns null if Stripe isn't configured, the id is bogus, or it's unpaid.
 */
export async function getPaidSessionSummary(
  sessionId: string
): Promise<{ id: string; totalCents: number; currency: string; itemCount: number } | null> {
  if (!process.env.STRIPE_SECRET_KEY || !sessionId.startsWith("cs_")) return null;
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (session.payment_status !== "paid") return null;
    return {
      id: session.id,
      totalCents: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
      itemCount: (session.line_items?.data ?? []).reduce((sum, li) => sum + (li.quantity ?? 0), 0),
    };
  } catch {
    return null;
  }
}
