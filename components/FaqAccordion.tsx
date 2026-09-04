"use client";

import { useState } from "react";
import { FaqItem } from "@/lib/types";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <dl className="divide-y divide-hairline border-t border-b border-hairline">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question}>
            <dt>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between text-left py-5 gap-4"
              >
                <span className="font-display font-semibold text-lg">
                  {item.question}
                </span>
                <span aria-hidden="true" className="text-xl shrink-0">
                  {isOpen ? "\u2212" : "+"}
                </span>
              </button>
            </dt>
            <dd
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 text-muted text-sm max-w-[60ch]"
            >
              {item.answer}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
