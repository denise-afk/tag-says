import type { Metadata } from "next";
import { TagBuilder } from "@/components/TagBuilder";

export const metadata: Metadata = {
  title: "Create Your Tag | TAG SAYS.",
  description:
    "Pick your license plate state, tell us who you are, and watch your custom bumper sticker come together in real time.",
};

export default function CreatePage() {
  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-12 sm:py-16">
      <p className="font-display font-semibold uppercase tracking-wide text-sm text-muted">
        Create Your Tag
      </p>
      <h1 className="font-display font-black uppercase text-4xl sm:text-5xl mt-2 mb-10 sm:mb-14">
        What does your tag say?
      </h1>

      <TagBuilder />
    </section>
  );
}
