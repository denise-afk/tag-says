export type SizeId = "compact" | "classic" | "wide";

export interface TagCustomization {
  /** USPS-style state/territory name as shown on the license plate, e.g. "Georgia" */
  tagState: string;
  /** Free-text identity line, e.g. "New Yorker" */
  identity: string;
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
