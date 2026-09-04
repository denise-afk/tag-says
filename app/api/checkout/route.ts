import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { CartLineItem } from "@/lib/types";

/**
 * POST /api/checkout
 *
 * Expects { lineItems: CartLineItem[] } and returns a Stripe Checkout
 * session URL to redirect the customer to. Not connected until
 * STRIPE_SECRET_KEY is configured — see lib/stripe.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { lineItems: CartLineItem[] };

    if (!body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const session = await createCheckoutSession({
      lineItems: body.lineItems,
      successUrl: `${origin}/checkout?status=success`,
      cancelUrl: `${origin}/cart`,
    });

    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 501 });
  }
}
