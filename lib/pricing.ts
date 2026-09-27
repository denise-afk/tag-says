import { SizeId } from "./types";
import { getSizeOption } from "./constants";

/**
 * Bundle deal: once the cart holds 2+ tags (any sizes, any designs),
 * every tag gets `discountPerTagCents` off. Two 11" x 3" tags = $35.
 * This is the single source of truth — the builder, the cart, and the
 * Stripe checkout session all price through here.
 */
export const BUNDLE = {
  minQuantity: 2,
  discountPerTagCents: 250,
  label: "Buy 2+, save $2.50 on every tag",
};

export function bundleDiscountPerTagCents(totalQuantity: number): number {
  return totalQuantity >= BUNDLE.minQuantity ? BUNDLE.discountPerTagCents : 0;
}

export function unitPriceCents(sizeId: SizeId, totalQuantity: number): number {
  return getSizeOption(sizeId).priceCents - bundleDiscountPerTagCents(totalQuantity);
}
