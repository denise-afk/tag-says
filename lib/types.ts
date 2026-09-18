export type SizeId = "compact" | "classic" | "wide";

/**
 * "state" is the flagship format: a license plate state on line one,
 * a free-text identity on line two (e.g. "GEORGIA TAG." / "NEW YORKER.").
 * "statement" opens both lines to free text, for things like faith,
 * callings, or any two-line statement (e.g. "ISAIAH 6:3." / "DISCIPLE.").
 */
export type TagMode = "state" | "statement";

export interface TagCustomization {
  mode: TagMode;
  /**
   * The raw text for line one, before formatting. In "state" mode this
   * is a US state/territory name (e.g. "Georgia") and gets " TAG."
   * appended when rendered. In "statement" mode it's rendered as-is,
   * just uppercased with a trailing period.
   */
  lineOneRaw: string;
  /** The raw text for line two \u2014 always free text, always the bold line. */
  lineTwoRaw: string;
  /** Which physical sticker size the customer chose */
  sizeId: SizeId;
}

export interface CartLineItem {
  /** Unique id for this specific customized line item (not the product id) */
  id: string;
  productSlug: "custom-tag";
  productName: string;
  customization: TagCustomization;
  /** Exact uppercase rendered copy, stored at add-to-cart time so it never drifts from what the customer saw */
  renderedLineOne: string;
  renderedLineTwo: string;
  quantity: number;
  /** Unit price in USD cents. Placeholder until real pricing is configured. */
  unitPriceCents: number;
  addedAt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
