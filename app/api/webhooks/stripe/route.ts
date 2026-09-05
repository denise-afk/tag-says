import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { submitFulfillmentOrder } from "@/lib/printify";
import { SizeId } from "@/lib/types";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe calls this the moment a checkout actually succeeds. This is the
 * ONLY place an order should be sent to Printify \u2014 never trigger
 * fulfillment from the client, since that could be spoofed without a
 * real payment.
 *
 * Setup required (see README):
 *   1. In the Stripe Dashboard \u2192 Developers \u2192 Webhooks, add an endpoint
 *      pointing at https://<your-domain>/api/webhooks/stripe, listening
 *      for the "checkout.session.completed" event.
 *   2. Copy the signing secret Stripe gives you into STRIPE_WEBHOOK_SECRET
 *      in Vercel's Environment Variables.
 *
 * Allow extra time: this handler renders artwork, uploads it, creates a
 * Printify product, and places an order \u2014 several sequential network
 * calls per cart line item.
 */
export const maxDuration = 60;

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 501 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, {
      status: 400,
    });
  }

  if (event.type !== "checkout.session.completed") {
    // Not the event we care about \u2014 acknowledge and ignore.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const stripe = getStripeClient();
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 100,
    });

    // Newer Stripe API versions moved the shipping address from a
    // top-level `shipping_details` field to `collected_information
    // .shipping_details`. Check both so this works regardless of which
    // API version your Stripe webhook endpoint is configured to send.
    const shipping =
      session.shipping_details ??
      (session as unknown as {
        collected_information?: { shipping_details?: Stripe.Checkout.Session.ShippingDetails };
      }).collected_information?.shipping_details;

    if (!shipping?.address) {
      throw new Error(
        `No shipping address on session ${session.id}; cannot fulfill.`
      );
    }

    const shippingAddress = {
      name: shipping.name ?? session.customer_details?.name ?? "Customer",
      email: session.customer_details?.email ?? undefined,
      line1: shipping.address.line1 ?? "",
      line2: shipping.address.line2 ?? undefined,
      city: shipping.address.city ?? "",
      state: shipping.address.state ?? "",
      postalCode: shipping.address.postal_code ?? "",
      country: shipping.address.country ?? "US",
    };

    const results = [];
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product | undefined;
      const metadata = product?.metadata;
      if (!metadata?.tagState || !metadata?.identity || !metadata?.sizeId) {
        // Not a TAG SAYS. custom line item (shouldn't happen) \u2014 skip it
        // rather than fail the whole order.
        continue;
      }

      const result = await submitFulfillmentOrder({
        orderId: `${session.id}-${item.id}`,
        customization: {
          tagState: metadata.tagState,
          identity: metadata.identity,
          sizeId: metadata.sizeId as SizeId,
        },
        quantity: item.quantity ?? 1,
        shippingAddress,
      });
      results.push(result);
    }

    return NextResponse.json({ received: true, fulfilled: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fulfillment failed.";
    // Returning 500 tells Stripe to retry this webhook later, which is
    // the right behavior for a transient Printify/network failure.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
