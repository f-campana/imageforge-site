import { CICheckExample } from "@/components/landing/CICheckExample";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { FinalCtaFooter } from "@/components/landing/FinalCtaFooter";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ManifestExample } from "@/components/landing/ManifestExample";
import { NextIntegration } from "@/components/landing/NextIntegration";
import { ProblemStrip } from "@/components/landing/ProblemStrip";
import { StatsStrip } from "@/components/landing/StatsStrip";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="noise-layer" aria-hidden="true" />
      <HeaderNav />
      <main>
        <Hero />
        <ProblemStrip />
        <HowItWorks />
        <FeaturesGrid />
        <StatsStrip />
        <ManifestExample />
        <CICheckExample />
        <NextIntegration />
        <FinalCtaFooter />
      </main>
    </div>
  );
}
