import Link from "next/link";
import { StickerPreview } from "./StickerPreview";
import { SITE } from "@/lib/constants";

export function Hero() {
  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="font-display font-semibold uppercase tracking-wide text-sm text-muted">
          {SITE.eyebrow}
        </p>
        <h1 className="font-display font-black uppercase leading-[0.9] text-5xl sm:text-6xl lg:text-7xl mt-4">
          {SITE.heroHeadline}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted max-w-[42ch]">
          {SITE.tagline} Create a clean, custom bumper sticker that tells the
          real story.
        </p>
        <Link
          href="/create"
          className="inline-block mt-8 px-7 py-3.5 bg-ink text-paper font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink/85 transition-colors"
        >
          Create Your Tag
        </Link>
      </div>

      <div>
        <StickerPreview tagState="Georgia" identity="New Yorker" size="large" />
        <p className="mt-3 text-xs text-muted">
          A real example. Yours starts with your own state and story.
        </p>
      </div>
    </section>
  );
}
