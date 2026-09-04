import { FaqAccordion } from "./FaqAccordion";
import { FAQ_ITEMS } from "@/lib/constants";

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="font-display font-black uppercase text-3xl sm:text-4xl mb-10">
          Questions, answered.
        </h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
