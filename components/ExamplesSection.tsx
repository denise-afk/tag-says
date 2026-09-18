import Link from "next/link";
import { StickerPreview } from "./StickerPreview";
import { EXAMPLE_TAGS, STATEMENT_EXAMPLE_TAGS } from "@/lib/constants";

export function ExamplesSection() {
  return (
    <section id="shop" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24">
        <p className="font-display font-semibold uppercase tracking-wide text-sm text-muted">
          Say it your way
        </p>
        <h2 className="font-display font-black uppercase text-3xl sm:text-4xl mt-3">
          Not just states.
        </h2>
        <p className="mt-3 text-muted max-w-[52ch]">
          Choose State Tag for the classic plate-and-identity format, or
          Your Statement for any two lines &mdash; faith, calling, or
          whatever&apos;s true for you.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {EXAMPLE_TAGS.map((example) => (
            <StickerPreview
              key={`${example.state}-${example.identity}`}
              mode="state"
              lineOneRaw={example.state}
              lineTwoRaw={example.identity}
              size="medium"
            />
          ))}
          {STATEMENT_EXAMPLE_TAGS.map((example) => (
            <StickerPreview
              key={`${example.lineOne}-${example.lineTwo}`}
              mode="statement"
              lineOneRaw={example.lineOne}
              lineTwoRaw={example.lineTwo}
              size="medium"
            />
          ))}
        </div>

        <Link
          href="/create"
          className="inline-block mt-10 px-7 py-3.5 border border-ink font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink hover:text-paper transition-colors"
        >
          Create Yours
        </Link>
      </div>
    </section>
  );
}
