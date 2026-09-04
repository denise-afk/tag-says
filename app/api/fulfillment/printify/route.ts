import { NextRequest, NextResponse } from "next/server";
import { submitFulfillmentOrder, generatePrintReadyFile } from "@/lib/printify";
import { FulfillmentOrderRequest } from "@/lib/printify";

/**
 * POST /api/fulfillment/printify
 *
 * Called server-side after a payment is confirmed (e.g. from a Stripe
 * webhook handler, not directly from the client). Generates the
 * 3371x971px print file and submits it to Printify. Not connected until
 * PRINTIFY_API_KEY / PRINTIFY_SHOP_ID are configured — see lib/printify.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FulfillmentOrderRequest;
    const printFile = await generatePrintReadyFile(body.customization);
    const result = await submitFulfillmentOrder(body, printFile);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Fulfillment submission failed.";
    return NextResponse.json({ error: message }, { status: 501 });
  }
}
