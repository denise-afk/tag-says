/**
 * Print-on-demand / fulfillment architecture (Printify or equivalent).
 *
 * NOTHING in this file makes a real network call yet. It exists so the
 * shape of the integration is clear and swapping in real credentials is a
 * small, contained change (see PRINTIFY_API_KEY / PRINTIFY_SHOP_ID in
 * .env.example).
 *
 * TAG SAYS. offers three physical sticker sizes (see SIZE_OPTIONS in
 * lib/constants.ts) matching the Printify catalog exactly:
 *   7.5" x 3.75"  ->  2250 x 1125 px @ 300 DPI
 *   11"  x 3"     ->  3300 x  900 px @ 300 DPI
 *   15"  x 3.75"  ->  4500 x 1125 px @ 300 DPI
 * Supported design formats: PNG, JPG, SVG.
 */

import { SizeId, TagCustomization } from "./types";
import { getSizeOption } from "./constants";

export const PRINT_FORMATS = ["png", "jpg", "svg"] as const;

export interface PrintSpec {
  widthPx: number;
  heightPx: number;
  dpi: number;
}

/**
 * Derives the exact print pixel dimensions for a given sticker size from
 * its real-world inches and DPI (inches x DPI = pixels). Keeping this as
 * a calculation — rather than hardcoded numbers per size — means a future
 * change to SIZE_OPTIONS (e.g. adding a size, or Printify tweaking DPI)
 * never risks the print file and the on-screen size drifting apart.
 */
export function getPrintSpec(sizeId: SizeId): PrintSpec {
  const size = getSizeOption(sizeId);
  return {
    widthPx: Math.round(size.widthIn * size.dpi),
    heightPx: Math.round(size.heightIn * size.dpi),
    dpi: size.dpi,
  };
}

export interface PrintReadyFile {
  /** e.g. "image/svg+xml" or "image/png" */
  mimeType: string;
  /** Base64-encoded file contents, or a URL once uploaded to storage. */
  data: string;
  widthPx: number;
  heightPx: number;
}

export interface FulfillmentOrderRequest {
  orderId: string;
  customization: TagCustomization;
  quantity: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface FulfillmentOrderResult {
  fulfillmentOrderId: string;
  status: "submitted" | "in_production" | "shipped" | "error";
  trackingUrl?: string;
}

/**
 * STEP 1-3: Turn a customer's fields into a print-ready file at the exact
 * Printify spec for their chosen size (see getPrintSpec()). Placeholder
 * implementation: real version should render the same layout as
 * <StickerPreview /> server-side (e.g. via an SVG template or headless
 * canvas) at the dimensions getPrintSpec(customization.sizeId) returns.
 */
export async function generatePrintReadyFile(
  customization: TagCustomization
): Promise<PrintReadyFile> {
  const spec = getPrintSpec(customization.sizeId);
  throw new Error(
    `generatePrintReadyFile() is a placeholder. Implement server-side ` +
      `rendering of the sticker at ${spec.widthPx}x${spec.heightPx}px ` +
      `(see getPrintSpec()) before calling this in production.`
  );
}

/**
 * STEP 4-5: Send the print file + order info to Printify (or another
 * POD provider) and store the returned fulfillment/order id.
 *
 * Requires PRINTIFY_API_KEY and PRINTIFY_SHOP_ID to be set server-side.
 * Never call this from client code — it must run in an API route or
 * server action so the API key is never exposed to the browser.
 */
export async function submitFulfillmentOrder(
  request: FulfillmentOrderRequest,
  printFile: PrintReadyFile
): Promise<FulfillmentOrderResult> {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!apiKey || !shopId) {
    throw new Error(
      "Printify is not configured. Set PRINTIFY_API_KEY and " +
        "PRINTIFY_SHOP_ID in your environment before submitting orders."
    );
  }

  // Real implementation: POST to
  // https://api.printify.com/v1/shops/{shopId}/orders.json
  // with the uploaded print file and shippingAddress, per Printify's docs.
  throw new Error("submitFulfillmentOrder() is not yet connected to Printify.");
}

/**
 * STEP 6: Poll or receive a webhook for shipping/tracking updates and
 * update the stored order record. Placeholder signature only.
 */
export async function getFulfillmentStatus(
  fulfillmentOrderId: string
): Promise<FulfillmentOrderResult> {
  throw new Error("getFulfillmentStatus() is not yet connected to Printify.");
}
