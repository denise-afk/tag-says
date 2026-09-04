import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";

export const metadata: Metadata = {
  title: "About | TAG SAYS.",
  description: "The idea behind TAG SAYS.: your license plate isn't the whole story.",
};

export default function AboutPage() {
  return (
    <>
      <AboutSection />
      <section id="contact" className="border-t border-hairline">
        <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24 max-w-[60ch]">
          <h2 className="font-display font-black uppercase text-2xl sm:text-3xl">
            Contact
          </h2>
          <p className="mt-4 text-muted">
            Reach out at{" "}
            <a href="mailto:hello@tagsays.com" className="underline underline-offset-2">
              hello@tagsays.com
            </a>{" "}
            &mdash; update this address once your domain and inbox are live.
          </p>
        </div>
      </section>
    </>
  );
}
