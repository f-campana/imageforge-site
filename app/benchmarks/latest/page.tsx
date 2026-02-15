import type { Metadata } from "next";

import { BenchmarkPageContent } from "@/components/benchmark/BenchmarkPageContent";
import {
  getBenchmarkHistory,
  getLatestBenchmarkSnapshot,
} from "@/lib/benchmark/load";

export const metadata: Metadata = {
  title: "ImageForge Benchmark Evidence | Latest Approved Snapshot",
  description:
    "Approved benchmark evidence for ImageForge CLI, generated from benchmark CI runs and synced through review-gated PRs.",
  alternates: {
    canonical: "/benchmarks/latest",
  },
};

export default function BenchmarkLatestPage() {
  const latest = getLatestBenchmarkSnapshot();
  const history = getBenchmarkHistory();

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <BenchmarkPageContent latest={latest} history={history} />
    </div>
  );
}
