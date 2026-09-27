"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { trackPixel } from "@/lib/metaPixel";

/**
 * Runs once on the checkout success page: reports the Purchase to the Meta
 * Pixel (once per Stripe session, even if the page is refreshed) and
 * empties the cart now that the order is paid.
 */
export function PurchaseTracker({
  sessionId,
  totalCents,
  currency,
  itemCount,
}: {
  sessionId: string;
  totalCents: number;
  currency: string;
  itemCount: number;
}) {
  const { clearCart, isHydrated } = useCart();

  useEffect(() => {
    if (!isHydrated) return;
    const key = `tagsays:purchase-tracked:${sessionId}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Storage unavailable — still track and clear below.
    }
    trackPixel("Purchase", { value: totalCents / 100, currency, num_items: itemCount });
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, sessionId]);

  return null;
}
