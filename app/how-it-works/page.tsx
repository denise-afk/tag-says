import type { Metadata } from "next";
import Link from "next/link";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How It Works | TAG SAYS.",
  description: "Two lines. Your story. Here's how a custom TAG SAYS. sticker comes together.",
};

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="font-display font-black uppercase text-4xl sm:text-5xl mb-10 sm:mb-14">
        Two lines. Your story.
      </h1>

      <ol className="grid sm:grid-cols-3 gap-10 sm:gap-8">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li key={step.number}>
            <span className="font-display font-semibold text-muted text-sm">
              {step.number}
            </span>
            <h2 className="font-display font-bold uppercase text-xl mt-2">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-muted max-w-[32ch]">{step.body}</p>
          </li>
        ))}
      </ol>

      <Link
        href="/create"
        className="inline-block mt-14 px-7 py-3.5 bg-ink text-paper font-display font-semibold uppercase tracking-wide text-sm hover:bg-ink/85 transition-colors"
      >
        Create Your Tag
      </Link>
    </section>
  );
}
