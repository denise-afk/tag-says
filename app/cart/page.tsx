"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { StickerPreview } from "@/components/StickerPreview";
import { getSizeOption } from "@/lib/constants";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartPage() {
  const { items, subtotalCents, updateQuantity, removeItem, isHydrated } =
    useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    setCheckoutError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems: items }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout isn't connected yet.");
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Checkout isn't connected yet."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isHydrated && items.length === 0) {
    return (
      <section className="mx-auto max-w-content px-5 sm:px-8 py-20 text-center">
        <h1 className="font-display font-black uppercase text-3xl sm:text-4xl">
          Your cart is empty.
        </h1>
        <p className="mt-3 text-muted">
          You haven&apos;t made a statement yet.
        </p>
        <Link
          href="/create"
          className="inline-block mt-8 px-7 py-3.5 bg-ink text-paper font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink/85 transition-colors"
        >
          Create Your Tag
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="font-display font-black uppercase text-4xl sm:text-5xl mb-10">
        Your Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <ul className="lg:col-span-2 divide-y divide-hairline border-t border-b border-hairline">
          {items.map((item) => (
            <li key={item.id} className="py-6 grid sm:grid-cols-[auto,1fr] gap-5">
              <div className="w-full sm:w-56">
                <StickerPreview
                  tagState={item.customization.tagState}
                  identity={item.customization.identity}
                  sizeId={item.customization.sizeId}
                  size="medium"
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="font-display font-semibold uppercase text-lg">
                    {item.productName}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Tag: {item.customization.tagState}
                  </p>
                  <p className="text-sm text-muted">
                    Identity: {item.customization.identity}
                  </p>
                  <p className="text-sm text-muted">
                    Size: {getSizeOption(item.customization.sizeId).label}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                  <div className="flex items-center border border-ink">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      aria-label={`Decrease quantity for ${item.customization.identity} tag`}
                      className="w-9 h-9 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="w-9 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity for ${item.customization.identity} tag`}
                      className="w-9 h-9 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-semibold">
                    {formatPrice(item.unitPriceCents * item.quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm underline underline-offset-2 text-muted hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="border border-ink p-6 h-fit">
          <div className="flex items-center justify-between font-display font-semibold uppercase text-sm mb-4">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          <p className="text-xs text-muted mb-6">
            Shipping and taxes calculated at checkout.
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full py-4 bg-ink text-paper font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink/85 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Redirecting..." : "Checkout"}
          </button>
          {checkoutError && (
            <p role="alert" className="mt-3 text-sm text-ink">
              {checkoutError} Payment processing isn&apos;t connected yet
              &mdash; see README for setup.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
