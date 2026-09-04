"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/states";
import { StickerPreview } from "./StickerPreview";
import {
  sanitizeIdentityInput,
  clampIdentityLength,
  buildStickerRender,
} from "@/lib/sticker";
import {
  IDENTITY_MAX_LENGTH,
  IDENTITY_WARN_LENGTH,
  SIZE_OPTIONS,
  DEFAULT_SIZE_ID,
  getSizeOption,
} from "@/lib/constants";
import { SizeId } from "@/lib/types";
import { useCart } from "@/context/CartContext";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function TagBuilder() {
  const router = useRouter();
  const { addItem } = useCart();

  const [tagState, setTagState] = useState("");
  const [identity, setIdentity] = useState("");
  const [sizeId, setSizeId] = useState<SizeId>(DEFAULT_SIZE_ID);
  const [quantity, setQuantity] = useState(1);
  const [touched, setTouched] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const render = useMemo(
    () => buildStickerRender(tagState, identity),
    [tagState, identity]
  );

  const selectedSize = getSizeOption(sizeId);
  const remaining = IDENTITY_MAX_LENGTH - identity.trim().length;
  const isLong = identity.trim().length >= IDENTITY_WARN_LENGTH;
  const showStateError = touched && !tagState;
  const showIdentityError = touched && !identity.trim();

  const handleIdentityChange = (raw: string) => {
    const sanitized = sanitizeIdentityInput(raw);
    const clamped = clampIdentityLength(sanitized, IDENTITY_MAX_LENGTH);
    setIdentity(clamped);
    if (justAdded) setJustAdded(false);
  };

  const handleAddToCart = () => {
    setTouched(true);
    if (!render.isValid) return;

    addItem({ tagState, identity: identity.trim(), sizeId }, quantity);
    setJustAdded(true);
  };

  const unitPrice = formatPrice(selectedSize.priceCents);
  const linePrice = formatPrice(selectedSize.priceCents * quantity);

  return (
    <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
      {/* Controls first on mobile, preview stacks below them */}
      <div className="order-1">
        <div className="space-y-7">
          <div>
            <label
              htmlFor="tag-state"
              className="block font-display font-semibold uppercase tracking-wide text-sm mb-2"
            >
              What does your tag say?
            </label>
            <select
              id="tag-state"
              value={tagState}
              onChange={(e) => setTagState(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={showStateError}
              aria-describedby={showStateError ? "state-error" : undefined}
              className="w-full border border-ink bg-paper px-4 py-3 text-base appearance-none"
            >
              <option value="" disabled>
                Select your license plate state
              </option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {showStateError && (
              <p id="state-error" className="mt-2 text-sm text-ink">
                Choose a state to continue.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="identity"
              className="block font-display font-semibold uppercase tracking-wide text-sm mb-2"
            >
              You say you&apos;re...
            </label>
            <input
              id="identity"
              type="text"
              value={identity}
              onChange={(e) => handleIdentityChange(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="New Yorker, Jamaican, Chicago Born..."
              maxLength={IDENTITY_MAX_LENGTH}
              aria-invalid={showIdentityError}
              aria-describedby="identity-help"
              className="w-full border border-ink bg-paper px-4 py-3 text-base"
            />
            <p id="identity-help" className="mt-2 text-sm text-muted">
              {showIdentityError
                ? "Tell us who you are to continue."
                : `${remaining} character${remaining === 1 ? "" : "s"} left`}
              {isLong && !showIdentityError && (
                <span className="block mt-1">
                  Longer names shrink slightly to stay legible on the sticker.
                </span>
              )}
            </p>
          </div>

          <fieldset>
            <legend className="block font-display font-semibold uppercase tracking-wide text-sm mb-2">
              Choose your size
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((option) => {
                const isSelected = option.id === sizeId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSizeId(option.id)}
                    aria-pressed={isSelected}
                    className={[
                      "border px-3 py-3 text-center transition-colors",
                      isSelected
                        ? "border-ink bg-ink text-paper"
                        : "border-ink text-ink hover:bg-ink/5",
                    ].join(" ")}
                  >
                    <span className="block font-display font-semibold text-sm">
                      {option.label}
                    </span>
                    <span
                      className={[
                        "block text-xs mt-1",
                        isSelected ? "text-paper/75" : "text-muted",
                      ].join(" ")}
                    >
                      {formatPrice(option.priceCents)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="pt-2 border-t border-hairline">
            <p className="font-display font-semibold uppercase tracking-wide text-sm mt-6 mb-4">
              Your Custom Tag
            </p>

            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center border border-ink">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-lg hover:bg-ink hover:text-paper transition-colors"
                >
                  &minus;
                </button>
                <span
                  className="w-10 text-center font-medium"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-lg hover:bg-ink hover:text-paper transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="font-display font-black text-2xl">
                  {linePrice}
                </p>
                <p className="text-xs text-muted">
                  {unitPrice} each &middot; {selectedSize.label} &middot; placeholder price
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 w-full py-4 bg-ink text-paper font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink/85 transition-colors"
            >
              Add My Tag
            </button>

            {justAdded && (
              <div
                role="status"
                className="mt-4 flex items-center justify-between text-sm border border-ink px-4 py-3"
              >
                <span>Added to cart.</span>
                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  className="font-semibold underline underline-offset-2"
                >
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="order-2 md:sticky md:top-24">
        <StickerPreview
          tagState={tagState}
          identity={identity}
          sizeId={sizeId}
          size="large"
        />
        <p className="mt-3 text-xs text-muted">
          Live preview &mdash; updates as you type.
        </p>
      </div>
    </div>
  );
}
