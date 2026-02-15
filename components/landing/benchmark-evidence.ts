export type BenchmarkEvidence = {
  asOfDate: string;
  owner: string;
  cliVersion: string;
  runner: string;
  nodeVersion: string;
  datasetVersion: string;
  profileId: "P1" | "P2" | "P3";
  scenario: "single-small" | "single-median" | "single-large" | "batch-all";
  sourceWorkflow: string;
  artifactUrl: string;
  sampleSet: {
    imageCount: number;
    inputBytes: number;
    outputBytes: number;
    outputLabel: string;
  };
  run: {
    durationSeconds: number;
    processed: number;
    cached: number;
    command: string;
  };
};

export const BENCHMARK_EVIDENCE: BenchmarkEvidence = {
  asOfDate: "February 15, 2026",
  owner: "ImageForge Maintainers (CLI + Growth)",
  cliVersion: process.env.NEXT_PUBLIC_IMAGEFORGE_VERSION ?? "local-dev",
  runner: "GitHub-hosted ubuntu-24.04",
  nodeVersion: "22",
  datasetVersion: "1.0.0",
  profileId: "P2",
  scenario: "batch-all",
  sourceWorkflow: "benchmark-ci.yml",
  artifactUrl:
    "https://github.com/f-campana/imageforge/actions/workflows/benchmark-ci.yml",
  sampleSet: {
    imageCount: 12,
    inputBytes: 8_400_000,
    outputBytes: 1_900_000,
    outputLabel: "WebP/AVIF derivatives",
  },
  run: {
    durationSeconds: 2.1,
    processed: 9,
    cached: 3,
    command: "imageforge ./public/images -f webp,avif",
  },
};

export function formatMegabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function reductionPercent(
  inputBytes: number,
  outputBytes: number,
): number {
  if (inputBytes <= 0) return 0;
  return Math.round((1 - outputBytes / inputBytes) * 100);
}
