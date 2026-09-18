"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/states";
import { StickerPreview } from "./StickerPreview";
import {
  sanitizeIdentityInput,
  clampLength,
  buildStickerRender,
} from "@/lib/sticker";
import {
  IDENTITY_MAX_LENGTH,
  IDENTITY_WARN_LENGTH,
  LINE_ONE_STATEMENT_MAX_LENGTH,
  SIZE_OPTIONS,
  DEFAULT_SIZE_ID,
  getSizeOption,
} from "@/lib/constants";
import { SizeId, TagMode } from "@/lib/types";
import { useCart } from "@/context/CartContext";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function TagBuilder() {
  const router = useRouter();
  const { addItem } = useCart();

  const [mode, setMode] = useState<TagMode>("state");

  // "state" mode fields
  const [tagState, setTagState] = useState("");
  const [identity, setIdentity] = useState("");

  // "statement" mode fields
  const [lineOneText, setLineOneText] = useState("");
  const [lineTwoText, setLineTwoText] = useState("");

  const [sizeId, setSizeId] = useState<SizeId>(DEFAULT_SIZE_ID);
  const [quantity, setQuantity] = useState(1);
  const [touched, setTouched] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // The active raw values, regardless of mode.
  const lineOneRaw = mode === "state" ? tagState : lineOneText;
  const lineTwoRaw = mode === "state" ? identity : lineTwoText;

  const render = useMemo(
    () => buildStickerRender(mode, lineOneRaw, lineTwoRaw),
    [mode, lineOneRaw, lineTwoRaw]
  );

  const selectedSize = getSizeOption(sizeId);
  const remaining = IDENTITY_MAX_LENGTH - lineTwoRaw.trim().length;
  const isLong = lineTwoRaw.trim().length >= IDENTITY_WARN_LENGTH;
  const showLineOneError = touched && !lineOneRaw.trim();
  const showLineTwoError = touched && !lineTwoRaw.trim();

  const switchMode = (next: TagMode) => {
    setMode(next);
    setTouched(false);
    setJustAdded(false);
  };

  const handleLineTwoChange = (raw: string) => {
    const sanitized = sanitizeIdentityInput(raw);
    const clamped = clampLength(sanitized, IDENTITY_MAX_LENGTH);
    if (mode === "state") setIdentity(clamped);
    else setLineTwoText(clamped);
    if (justAdded) setJustAdded(false);
  };

  const handleLineOneStatementChange = (raw: string) => {
    const sanitized = sanitizeIdentityInput(raw);
    const clamped = clampLength(sanitized, LINE_ONE_STATEMENT_MAX_LENGTH);
    setLineOneText(clamped);
    if (justAdded) setJustAdded(false);
  };

  const handleAddToCart = () => {
    setTouched(true);
    if (!render.isValid) return;

    addItem(
      {
        mode,
        lineOneRaw: lineOneRaw.trim(),
        lineTwoRaw: lineTwoRaw.trim(),
        sizeId,
      },
      quantity
    );
    setJustAdded(true);
  };

  const unitPrice = formatPrice(selectedSize.priceCents);
  const linePrice = formatPrice(selectedSize.priceCents * quantity);

  return (
    <div>
      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="Tag type"
        className="inline-flex border border-ink mb-10"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "state"}
          onClick={() => switchMode("state")}
          className={[
            "px-5 py-2.5 font-display font-semibold uppercase tracking-wide text-sm transition-colors",
            mode === "state" ? "bg-ink text-paper" : "text-ink hover:bg-ink/5",
          ].join(" ")}
        >
          State Tag
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "statement"}
          onClick={() => switchMode("statement")}
          className={[
            "px-5 py-2.5 font-display font-semibold uppercase tracking-wide text-sm transition-colors border-l border-ink",
            mode === "statement" ? "bg-ink text-paper" : "text-ink hover:bg-ink/5",
          ].join(" ")}
        >
          Your Statement
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Controls first on mobile, preview stacks below them */}
        <div className="order-1">
          <div className="space-y-7">
            {mode === "state" ? (
              <>
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
                    aria-invalid={showLineOneError}
                    aria-describedby={showLineOneError ? "state-error" : undefined}
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
                  {showLineOneError && (
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
                    onChange={(e) => handleLineTwoChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="New Yorker, Jamaican, Chicago Born..."
                    maxLength={IDENTITY_MAX_LENGTH}
                    aria-invalid={showLineTwoError}
                    aria-describedby="identity-help"
                    className="w-full border border-ink bg-paper px-4 py-3 text-base"
                  />
                  <p id="identity-help" className="mt-2 text-sm text-muted">
                    {showLineTwoError
                      ? "Tell us who you are to continue."
                      : `${remaining} character${remaining === 1 ? "" : "s"} left`}
                    {isLong && !showLineTwoError && (
                      <span className="block mt-1">
                        Longer names shrink slightly to stay legible on the sticker.
                      </span>
                    )}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="line-one"
                    className="block font-display font-semibold uppercase tracking-wide text-sm mb-2"
                  >
                    Line one &mdash; the small line
                  </label>
                  <input
                    id="line-one"
                    type="text"
                    value={lineOneText}
                    onChange={(e) => handleLineOneStatementChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="Isaiah 6:3, John 3:16, Rooted In..."
                    maxLength={LINE_ONE_STATEMENT_MAX_LENGTH}
                    aria-invalid={showLineOneError}
                    aria-describedby="line-one-help"
                    className="w-full border border-ink bg-paper px-4 py-3 text-base"
                  />
                  <p id="line-one-help" className="mt-2 text-sm text-muted">
                    {showLineOneError
                      ? "Add a first line to continue."
                      : `${LINE_ONE_STATEMENT_MAX_LENGTH - lineOneText.trim().length} characters left`}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="line-two"
                    className="block font-display font-semibold uppercase tracking-wide text-sm mb-2"
                  >
                    Line two &mdash; the bold line
                  </label>
                  <input
                    id="line-two"
                    type="text"
                    value={lineTwoText}
                    onChange={(e) => handleLineTwoChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="Disciple, Called, Chosen..."
                    maxLength={IDENTITY_MAX_LENGTH}
                    aria-invalid={showLineTwoError}
                    aria-describedby="line-two-help"
                    className="w-full border border-ink bg-paper px-4 py-3 text-base"
                  />
                  <p id="line-two-help" className="mt-2 text-sm text-muted">
                    {showLineTwoError
                      ? "Add a bold line to continue."
                      : `${remaining} character${remaining === 1 ? "" : "s"} left`}
                    {isLong && !showLineTwoError && (
                      <span className="block mt-1">
                        Longer lines shrink slightly to stay legible on the sticker.
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}

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
                    {unitPrice} each &middot; {selectedSize.label}
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
            mode={mode}
            lineOneRaw={lineOneRaw}
            lineTwoRaw={lineTwoRaw}
            sizeId={sizeId}
            size="large"
          />
          <p className="mt-3 text-xs text-muted">
            Live preview &mdash; updates as you type.
          </p>
        </div>
      </div>
    </div>
  );
}
