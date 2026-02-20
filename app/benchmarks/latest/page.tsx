import type { Metadata } from "next";
import Link from "next/link";

import { BenchmarkPageContent } from "@/components/benchmark/BenchmarkPageContent";
import {
  getBenchmarkHistory,
  getLatestBenchmarkSnapshot,
} from "@/lib/benchmark/load";

const BENCHMARK_TITLE =
  "ImageForge Benchmark Evidence | Latest Approved Snapshot";
const BENCHMARK_DESCRIPTION =
  "Approved benchmark evidence for ImageForge CLI, generated from benchmark CI runs and synced through review-gated PRs.";

export const metadata: Metadata = {
  title: BENCHMARK_TITLE,
  description: BENCHMARK_DESCRIPTION,
  alternates: {
    canonical: "/benchmarks/latest",
  },
  openGraph: {
    title: BENCHMARK_TITLE,
    description: BENCHMARK_DESCRIPTION,
    type: "website",
    url: "/benchmarks/latest",
    images: [
      {
        url: "/benchmarks/latest/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ImageForge benchmark evidence social card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BENCHMARK_TITLE,
    description: BENCHMARK_DESCRIPTION,
    images: [
      {
        url: "/benchmarks/latest/twitter-image",
        alt: "ImageForge benchmark evidence preview card",
      },
    ],
  },
};

export default function BenchmarkLatestPage() {
  const latest = getLatestBenchmarkSnapshot();
  const history = getBenchmarkHistory();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080d]/86 backdrop-blur-md">
        <div className="section-shell py-4 md:py-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="ui-interact-link ui-focus-ring shrink-0 font-mono text-lg font-semibold tracking-tight text-zinc-100 hover:text-white"
            >
              imageforge
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[0.68rem] tracking-[0.08em] text-zinc-500 uppercase sm:inline">
                benchmark evidence
              </span>
              <Link
                href="/"
                className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-zinc-200 uppercase hover:border-white/30 hover:text-zinc-100"
              >
                Back to landing
              </Link>
            </div>
          </div>
        </div>
      </header>
      <BenchmarkPageContent latest={latest} history={history} />
    </div>
  );
}
