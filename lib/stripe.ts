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
import { getSizeOption } from "./constants";

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

  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    request.lineItems.map((item) => {
      const sizeLabel = getSizeOption(item.customization.sizeId).label;
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.unitPriceCents,
          product_data: {
            name: `${item.productName} \u2014 ${item.renderedLineOne} / ${item.renderedLineTwo}`,
            description: `Size: ${sizeLabel}`,
            // Order metadata Printify fulfillment will need later, kept
            // on the line item so it survives all the way to the paid
            // Checkout Session (see the webhook handler you'll add for
            // step 3 of fulfillment).
            metadata: {
              tagState: item.customization.tagState,
              identity: item.customization.identity,
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
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  return { sessionId: session.id, url: session.url };
}
