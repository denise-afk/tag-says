/**
 * Payment architecture placeholder.
 *
 * Wire this up to Stripe (or another processor) once STRIPE_SECRET_KEY is
 * available server-side. Nothing here fakes a completed payment.
 */

import { CartLineItem } from "./types";

export interface CheckoutSessionRequest {
  lineItems: CartLineItem[];
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<CheckoutSessionResult> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your server " +
        "environment, then implement createCheckoutSession() using the " +
        "Stripe SDK (stripe.checkout.sessions.create)."
    );
  }

  // Real implementation:
  // const stripe = new Stripe(secretKey);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return { sessionId: session.id, url: session.url! };
  throw new Error("createCheckoutSession() is not yet connected to Stripe.");
}
