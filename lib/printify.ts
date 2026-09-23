/**
 * Print-on-demand fulfillment (Printify), fully implemented.
 *
 * Requires PRINTIFY_API_KEY and PRINTIFY_SHOP_ID to be set server-side
 * (Vercel Project Settings \u2192 Environment Variables). BLUEPRINT_ID and
 * PRINT_PROVIDER_ID below identify the exact bumper sticker product +
 * manufacturer combination in your Printify "TAG SAYS Website" store
 * (shop 28824707) \u2014 change these only if you switch blueprints/providers
 * in Printify.
 *
 * Flow for each order line item, per size (see SIZE_OPTIONS in
 * lib/constants.ts for each size's printifyVariantId):
 *   1. Render the customer's exact tag as an SVG at print resolution.
 *   2. Rasterize that SVG to a PNG (Printify's upload API rejects raw
 *      SVG uploads with a generic error, so we convert first).
 *   3. Upload the PNG to Printify (Uploads API) \u2192 get an image id.
 *   4. Create a one-off Printify product using that image + variant.
 *   5. Place an order against that product \u2192 get a fulfillment order id.
 */

import sharp from "sharp";
import * as opentype from "opentype.js";
import { SizeId, TagCustomization } from "./types";
import { getSizeOption } from "./constants";
import { formatLineOne, formatLineTwo } from "./sticker";
import { STICKER_FONT_BASE64 } from "./font-data";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";
const BLUEPRINT_ID = 598;
const PRINT_PROVIDER_ID = 73;

export const PRINT_FORMATS = ["png", "jpg", "svg"] as const;

export interface PrintSpec {
  widthPx: number;
  heightPx: number;
  dpi: number;
}

/**
 * Derives the exact print pixel dimensions for a given sticker size from
 * its real-world inches and DPI (inches x DPI = pixels).
 */
export function getPrintSpec(sizeId: SizeId): PrintSpec {
  const size = getSizeOption(sizeId);
  return {
    widthPx: Math.round(size.widthIn * size.dpi),
    heightPx: Math.round(size.heightIn * size.dpi),
    dpi: size.dpi,
  };
}

function getCredentials(): { apiKey: string; shopId: string } {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!apiKey || !shopId) {
    throw new Error(
      "Printify is not configured. Set PRINTIFY_API_KEY and " +
        "PRINTIFY_SHOP_ID in your environment (Vercel Project Settings " +
        "\u2192 Environment Variables)."
    );
  }
  return { apiKey, shopId };
}

async function printifyFetch(
  path: string,
  apiKey: string,
  init: RequestInit = {},
  stepLabel: string = "Printify request"
): Promise<any> {
  const res = await fetch(`${PRINTIFY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    // Printify's error responses vary in shape \u2014 sometimes a plain
    // "error" string, sometimes a nested "errors" object with per-field
    // validation detail. Surface as much of it as possible so failures
    // are debuggable instead of showing a bare "Operation failed."
    const detail =
      body && typeof body === "object"
        ? JSON.stringify(body)
        : String(body ?? "");
    throw new Error(
      `${stepLabel} failed (HTTP ${res.status}) at ${path}: ${detail}`
    );
  }

  return body;
}

let cachedFont: opentype.Font | null = null;

/**
 * Loads the embedded font once per process and caches it. Using
 * opentype.js to parse it \u2014 rather than handing the font to an SVG
 * renderer via @font-face \u2014 means WE control exactly how each letter
 * becomes geometry, instead of relying on whatever SVG/font engine a
 * given server happens to have.
 */
function getFont(): opentype.Font {
  if (cachedFont) return cachedFont;
  const buffer = Buffer.from(STICKER_FONT_BASE64, "base64");
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  cachedFont = opentype.parse(arrayBuffer as ArrayBuffer);
  return cachedFont;
}

/**
 * Converts a line of text into a single SVG <path> string of solid
 * vector shapes \u2014 no font reference, no text element, nothing for a
 * renderer to interpret at draw time. (x, y) is the left end of the
 * text baseline, matching where SVG <text> would have sat.
 */
function textToPathData(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  extraLetterSpacing = 0
): string {
  const font = getFont();
  let cursorX = x;
  let d = "";
  for (const char of text) {
    const glyphPath = font.getPath(char, cursorX, y, fontSize);
    d += glyphPath.toPathData(2) + " ";
    cursorX += font.getAdvanceWidth(char, fontSize) + extraLetterSpacing;
  }
  return d.trim();
}

/**
 * Builds the sticker artwork as a self-contained SVG, matching the
 * on-site <StickerPreview /> layout, sized exactly to the size's print
 * spec. Every letter is pre-converted to solid vector outlines (see
 * textToPathData above) rather than left as an SVG <text> element with
 * a referenced font. That distinction matters: a server rasterizing
 * this file only needs to fill in shapes it's handed, with no font of
 * its own to find, load, or support \u2014 eliminating an entire class of
 * "renders blank because the font didn't load" failures, regardless of
 * which service (Printify's included) ends up processing the file.
 */
export function generateStickerSvg(customization: TagCustomization): string {
  const spec = getPrintSpec(customization.sizeId);
  const lineOne = formatLineOne(customization.mode, customization.lineOneRaw);
  const lineTwo = formatLineTwo(customization.lineTwoRaw);

  const marginX = Math.round(spec.widthPx * 0.06);
  const line1Size = Math.round(spec.heightPx * 0.14);
  const line2Size = Math.round(spec.heightPx * 0.42);
  const line1Y = Math.round(spec.heightPx * 0.28);
  const ruleY = line1Y + Math.round(spec.heightPx * 0.06);
  const line2Y = Math.round(spec.heightPx * 0.78);
  const ruleWidth = Math.round(spec.widthPx * 0.32);
  const strokeWidth = Math.max(2, Math.round(spec.heightPx * 0.004));

  const line1Path = textToPathData(lineOne, marginX, line1Y, line1Size, 2);
  const line2Path = textToPathData(lineTwo, marginX, line2Y, line2Size);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.widthPx}" height="${spec.heightPx}" viewBox="0 0 ${spec.widthPx} ${spec.heightPx}">
<rect x="0" y="0" width="${spec.widthPx}" height="${spec.heightPx}" fill="#ffffff" stroke="#0a0a0a" stroke-width="${strokeWidth}"/>
<path d="${line1Path}" fill="#0a0a0a" fill-opacity="0.7"/>
<line x1="${marginX}" y1="${ruleY}" x2="${marginX + ruleWidth}" y2="${ruleY}" stroke="#0a0a0a" stroke-opacity="0.6" stroke-width="${strokeWidth}"/>
<path d="${line2Path}" fill="#0a0a0a"/>
</svg>`;
}

/**
 * Uploads the sticker's PNG artwork to Printify's Uploads API and
 * returns the resulting image id, used later to build a print area.
 * The SVG is rasterized to PNG first, at its exact print pixel
 * dimensions, since Printify's uploads endpoint rejects raw SVG.
 */
async function uploadStickerImageToPrintify(
  customization: TagCustomization,
  fileName: string,
  apiKey: string
): Promise<string> {
  const svg = generateStickerSvg(customization);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const base64 = pngBuffer.toString("base64");

  const result = await printifyFetch(
    "/uploads/images.json",
    apiKey,
    {
      method: "POST",
      body: JSON.stringify({
        file_name: fileName,
        contents: base64,
      }),
    },
    "Image upload"
  );
  return result.id as string;
}

/**
 * Creates a one-off, unpublished Printify product carrying this specific
 * customer's design on the correct variant, and returns its product id.
 */
async function createOneOffProduct(
  customization: TagCustomization,
  imageId: string,
  apiKey: string,
  shopId: string
): Promise<string> {
  const size = getSizeOption(customization.sizeId);
  const title = `TAG SAYS \u2014 ${customization.lineOneRaw} / ${customization.lineTwoRaw}`.slice(
    0,
    80
  );

  const result = await printifyFetch(
    `/shops/${shopId}/products.json`,
    apiKey,
    {
      method: "POST",
      body: JSON.stringify({
        title,
        description: `Custom TAG SAYS. order: ${formatLineOne(customization.mode, customization.lineOneRaw)} ${formatLineTwo(customization.lineTwoRaw)}`,
        blueprint_id: BLUEPRINT_ID,
        print_provider_id: PRINT_PROVIDER_ID,
        variants: [
          {
            id: size.printifyVariantId,
            price: size.priceCents,
            is_enabled: true,
          },
        ],
        print_areas: [
          {
            variant_ids: [size.printifyVariantId],
            placeholders: [
              {
                position: "front",
                images: [
                  {
                    id: imageId,
                    x: 0.5,
                    y: 0.5,
                    scale: 1,
                    angle: 0,
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
    "Product creation"
  );

  return result.id as string;
}

export interface FulfillmentOrderRequest {
  orderId: string;
  customization: TagCustomization;
  quantity: number;
  shippingAddress: {
    name: string;
    email?: string;
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
 * Full pipeline: render this customer's exact design, upload it, create
 * a one-off product for it, and place the Printify order \u2014 all for one
 * cart line item. Called from the Stripe webhook once payment succeeds
 * (see app/api/webhooks/stripe/route.ts).
 */
export async function submitFulfillmentOrder(
  request: FulfillmentOrderRequest
): Promise<FulfillmentOrderResult> {
  const { apiKey, shopId } = getCredentials();
  const size = getSizeOption(request.customization.sizeId);

  const fileName = `${request.orderId}-${request.customization.sizeId}.png`;
  const imageId = await uploadStickerImageToPrintify(
    request.customization,
    fileName,
    apiKey
  );

  const productId = await createOneOffProduct(
    request.customization,
    imageId,
    apiKey,
    shopId
  );

  const [firstName, ...rest] = request.shippingAddress.name.split(" ");
  const lastName = rest.join(" ") || firstName;

  const order = await printifyFetch(
    `/shops/${shopId}/orders.json`,
    apiKey,
    {
      method: "POST",
      body: JSON.stringify({
        external_id: request.orderId,
        line_items: [
          {
            product_id: productId,
            variant_id: size.printifyVariantId,
            quantity: request.quantity,
          },
        ],
        shipping_method: 1,
        send_shipping_notification: true,
        address_to: {
          first_name: firstName,
          last_name: lastName,
          email: request.shippingAddress.email ?? "orders@tagsays.com",
          phone: "",
          country: request.shippingAddress.country,
          region: request.shippingAddress.state,
          address1: request.shippingAddress.line1,
          address2: request.shippingAddress.line2 ?? "",
          city: request.shippingAddress.city,
          zip: request.shippingAddress.postalCode,
        },
      }),
    },
    "Order creation"
  );

  return {
    fulfillmentOrderId: order.id,
    status: "submitted",
  };
}

/**
 * Checks an order's current status with Printify \u2014 useful for a future
 * order-tracking page. Not yet called anywhere.
 */
export async function getFulfillmentStatus(
  fulfillmentOrderId: string
): Promise<FulfillmentOrderResult> {
  const { apiKey, shopId } = getCredentials();
  const order = await printifyFetch(
    `/shops/${shopId}/orders/${fulfillmentOrderId}.json`,
    apiKey
  );

  const statusMap: Record<string, FulfillmentOrderResult["status"]> = {
    pending: "submitted",
    "on-hold": "submitted",
    "in-production": "in_production",
    shipped: "shipped",
  };

  return {
    fulfillmentOrderId,
    status: statusMap[order.status] ?? "submitted",
    trackingUrl: order.shipments?.[0]?.url,
  };
}
