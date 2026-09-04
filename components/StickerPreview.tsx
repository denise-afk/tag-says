"use client";

import { formatTagLine, formatIdentityLine, identityScaleFactor } from "@/lib/sticker";
import { getSizeOption } from "@/lib/constants";
import { SizeId } from "@/lib/types";

interface StickerPreviewProps {
  tagState: string;
  identity: string;
  sizeId?: SizeId;
  /** Smaller variant for grids/examples vs. the large builder preview. */
  size?: "large" | "medium";
}

/**
 * Renders the actual sticker face: white ground, black rule, black type.
 * Aspect ratio always matches the real product dimensions for the chosen
 * size (see SIZE_OPTIONS in lib/constants.ts), so what customers see here
 * is proportionally true to what gets printed.
 */
export function StickerPreview({
  tagState,
  identity,
  sizeId = "classic",
  size = "large",
}: StickerPreviewProps) {
  const lineOne = tagState ? formatTagLine(tagState) : "YOUR STATE TAG.";
  const lineTwo = identity.trim() ? formatIdentityLine(identity) : "WHO YOU ARE.";
  const scale = identity.trim() ? identityScaleFactor(identity) : 1;

  const isPlaceholder = !tagState || !identity.trim();
  const sizeOption = getSizeOption(sizeId);
  const aspectRatio = `${sizeOption.widthIn} / ${sizeOption.heightIn}`;

  return (
    <div
      role="img"
      aria-label={
        isPlaceholder
          ? "Sticker preview, not yet complete"
          : `Sticker preview: ${lineOne} ${lineTwo}`
      }
      style={{ aspectRatio }}
      className={[
        "relative w-full select-none",
        "border border-ink",
        "bg-paper",
        "flex flex-col items-start justify-center",
        size === "large" ? "px-6 py-4 sm:px-10 sm:py-6" : "px-4 py-3",
        isPlaceholder ? "opacity-50" : "opacity-100",
        "transition-opacity duration-200",
      ].join(" ")}
    >
      <span
        className={[
          "font-display font-semibold uppercase leading-none text-ink/70",
          size === "large" ? "text-[3.2vw] sm:text-base md:text-lg" : "text-xs sm:text-sm",
          "tracking-wide",
        ].join(" ")}
      >
        {lineOne}
      </span>

      <span
        className={[
          "block h-px bg-ink/60",
          size === "large" ? "w-2/5 my-2 sm:my-3" : "w-1/3 my-1.5",
        ].join(" ")}
        aria-hidden="true"
      />

      <span
        className={[
          "font-display font-black uppercase leading-[0.85] text-ink",
          size === "large"
            ? "text-[8.5vw] sm:text-5xl md:text-6xl"
            : "text-2xl sm:text-3xl",
        ].join(" ")}
        style={{ transform: `scaleX(${scale})`, transformOrigin: "left" }}
      >
        {lineTwo}
      </span>

      <span className="sr-only">{sizeOption.label} sticker</span>
    </div>
  );
}
