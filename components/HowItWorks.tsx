import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="font-display font-black uppercase text-3xl sm:text-4xl">
          Two lines. Your story.
        </h2>

        <ol className="mt-12 grid sm:grid-cols-3 gap-10 sm:gap-8">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step.number}>
              <span className="font-display font-semibold text-muted text-sm">
                {step.number}
              </span>
              <h3 className="font-display font-bold uppercase text-xl mt-2">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted max-w-[32ch]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
