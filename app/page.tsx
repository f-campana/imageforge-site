import { CICheckExample } from "@/components/landing/CICheckExample";
import { ComparisonAndCost } from "@/components/landing/ComparisonAndCost";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { FinalCtaFooter } from "@/components/landing/FinalCtaFooter";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Limitations } from "@/components/landing/Limitations";
import { NextIntegration } from "@/components/landing/NextIntegration";
import { ProblemStrip } from "@/components/landing/ProblemStrip";
import { SegmentUseCases } from "@/components/landing/SegmentUseCases";
import { StatsStrip } from "@/components/landing/StatsStrip";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <HeaderNav />
      <main>
        <Hero />
        <ProblemStrip />
        <ComparisonAndCost />
        <HowItWorks />
        <FeaturesGrid />
        <StatsStrip />
        <CICheckExample />
        <NextIntegration />
        <SegmentUseCases />
        <Limitations />
        <FinalCtaFooter />
      </main>
    </div>
  );
}
