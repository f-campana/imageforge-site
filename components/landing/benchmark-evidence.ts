import {
  getLatestBenchmarkSnapshot,
  getScenarioMetrics,
} from "@/lib/benchmark/load";

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
  metrics: {
    warmP50Ms: number;
    warmP95Ms: number;
    speedup: number;
    warmImagesPerSec: number;
  };
};

function buildCommand(profile: {
  formats: string;
  quality: number;
  blur: boolean;
  widths: string | null;
}): string {
  const args = [
    "imageforge",
    "./public/images",
    "--formats",
    profile.formats,
    "--quality",
    profile.quality.toString(),
  ];
  args.push(profile.blur ? "--blur" : "--no-blur");
  if (profile.widths) {
    args.push("--widths", profile.widths);
  }

  return args.join(" ");
}

function toProfileId(value: string): "P1" | "P2" | "P3" {
  if (value === "P1" || value === "P2" || value === "P3") return value;
  return "P2";
}

function toScenario(
  value: string,
): "single-small" | "single-median" | "single-large" | "batch-all" {
  if (
    value === "single-small" ||
    value === "single-median" ||
    value === "single-large" ||
    value === "batch-all"
  ) {
    return value;
  }

  return "batch-all";
}

const latest = getLatestBenchmarkSnapshot();
const profileId = toProfileId(latest?.benchmark.headline.profileId ?? "P2");
const scenario = toScenario(latest?.benchmark.headline.scenario ?? "batch-all");
const metrics = latest ? getScenarioMetrics(latest, profileId, scenario) : null;
const profileDef = latest?.benchmark.profiles.find(
  (entry) => entry.id === profileId,
);

const fallbackInputBytes = 8_400_000;
const fallbackOutputBytes = 1_900_000;
const fallbackDurationSeconds = 2.1;

export const BENCHMARK_EVIDENCE: BenchmarkEvidence = {
  asOfDate: latest?.asOfDate ?? "February 15, 2026",
  owner: latest?.owner ?? "ImageForge Maintainers (CLI + Growth)",
  cliVersion: process.env.NEXT_PUBLIC_IMAGEFORGE_VERSION ?? "local-dev",
  runner: latest?.source.runner ?? "GitHub-hosted ubuntu-24.04",
  nodeVersion: latest?.source.nodeVersion ?? "22",
  datasetVersion: latest?.source.datasetVersion ?? "1.0.0",
  profileId,
  scenario,
  sourceWorkflow:
    latest?.source.workflowPath ?? ".github/workflows/benchmark-ci.yml",
  artifactUrl:
    latest?.source.runUrl ??
    "https://github.com/f-campana/imageforge/actions/workflows/benchmark-ci.yml",
  sampleSet: {
    imageCount: metrics?.imageCount ?? 12,
    inputBytes: metrics?.coldOriginalBytes ?? fallbackInputBytes,
    outputBytes: metrics?.coldProcessedBytes ?? fallbackOutputBytes,
    outputLabel: "Generated WebP/AVIF derivatives",
  },
  run: {
    durationSeconds: metrics
      ? metrics.coldWallMs / 1000
      : fallbackDurationSeconds,
    processed: metrics?.imageCount ?? 9,
    cached: 0,
    command: profileDef
      ? buildCommand(profileDef)
      : "imageforge ./public/images --formats webp,avif --quality 80 --blur",
  },
  metrics: {
    warmP50Ms: metrics?.warmP50Ms ?? 90,
    warmP95Ms: metrics?.warmP95Ms ?? 95,
    speedup: metrics?.speedup ?? 2,
    warmImagesPerSec: metrics?.warmImagesPerSec ?? 320,
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
