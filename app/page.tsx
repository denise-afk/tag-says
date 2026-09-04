import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ExamplesSection } from "@/components/ExamplesSection";
import { AboutSection } from "@/components/AboutSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { FaqSection } from "@/components/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ExamplesSection />
      <AboutSection />
      <SocialProofSection />
      <FaqSection />
    </>
  );
}
