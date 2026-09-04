import type { Metadata } from "next";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ | TAG SAYS.",
  description: "Answers to common questions about custom TAG SAYS. bumper stickers.",
};

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-content px-5 sm:px-8 py-12 sm:py-16">
      <h1 className="font-display font-black uppercase text-4xl sm:text-5xl mb-10">
        Questions, answered.
      </h1>
      <FaqAccordion items={FAQ_ITEMS} />
    </section>
  );
}
