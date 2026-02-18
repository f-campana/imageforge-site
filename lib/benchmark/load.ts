import fixtureHistorySampleRaw from "@/data/benchmarks/fixtures/history-sample.json";
import fixtureLatestSampleRaw from "@/data/benchmarks/fixtures/latest-sample.json";
import historyRaw from "@/data/benchmarks/history.json";
import latestRaw from "@/data/benchmarks/latest.json";

import type {
  BenchmarkHistoryFile,
  BenchmarkScenarioMetrics,
  SiteBenchmarkSnapshot,
} from "@/lib/benchmark/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function parseScenarioMetrics(value: unknown): BenchmarkScenarioMetrics {
  const entry = isRecord(value) ? value : {};
  return {
    runCount: asNumber(entry.runCount),
    imageCount: asNumber(entry.imageCount),
    coldWallMs: asNumber(entry.coldWallMs),
    warmMeanMs: asNumber(entry.warmMeanMs),
    warmP50Ms: asNumber(entry.warmP50Ms),
    warmP95Ms: asNumber(entry.warmP95Ms),
    warmStddevMs: asNumber(entry.warmStddevMs),
    speedup: asNumber(entry.speedup),
    coldImagesPerSec: asNumber(entry.coldImagesPerSec),
    warmImagesPerSec: asNumber(entry.warmImagesPerSec),
    coldPerImageMs: asNumber(entry.coldPerImageMs),
    warmPerImageMs: asNumber(entry.warmPerImageMs),
    coldOriginalBytes: asNumber(entry.coldOriginalBytes),
    coldProcessedBytes: asNumber(entry.coldProcessedBytes),
    validationPassed: asBoolean(entry.validationPassed),
  };
}

function parseSnapshot(value: unknown): SiteBenchmarkSnapshot | null {
  if (!isRecord(value)) return null;
  if (asString(value.schemaVersion) !== "1.0") return null;

  const source = isRecord(value.source) ? value.source : {};
  const thresholds = isRecord(value.thresholds) ? value.thresholds : {};
  const summary = isRecord(value.summary) ? value.summary : {};
  const benchmark = isRecord(value.benchmark) ? value.benchmark : {};
  const headline = isRecord(benchmark.headline) ? benchmark.headline : {};

  const profiles = Array.isArray(benchmark.profiles)
    ? benchmark.profiles.filter(isRecord).map((entry) => ({
        id: asString(entry.id),
        formats: asString(entry.formats),
        quality: asNumber(entry.quality),
        blur: asBoolean(entry.blur),
        widths: entry.widths === null ? null : asString(entry.widths, ""),
        description: asString(entry.description),
      }))
    : [];

  const scenarios = Array.isArray(benchmark.scenarios)
    ? benchmark.scenarios.filter(isRecord).map((entry) => ({
        name: asString(entry.name),
        expectedTotal: asNumber(entry.expectedTotal),
      }))
    : [];

  const profileScenarioMetricsRaw = isRecord(value.profileScenarioMetrics)
    ? value.profileScenarioMetrics
    : {};
  const profileScenarioMetrics: SiteBenchmarkSnapshot["profileScenarioMetrics"] =
    {};

  for (const [profileId, scenarioMapRaw] of Object.entries(
    profileScenarioMetricsRaw,
  )) {
    if (!isRecord(scenarioMapRaw)) continue;
    profileScenarioMetrics[profileId] = {};

    for (const [scenarioName, metricRaw] of Object.entries(scenarioMapRaw)) {
      profileScenarioMetrics[profileId][scenarioName] =
        parseScenarioMetrics(metricRaw);
    }
  }

  const deltas = Array.isArray(value.deltas)
    ? value.deltas.filter(isRecord).map((entry) => ({
        profileId: asString(entry.profileId),
        scenario: asString(entry.scenario),
        warmP50Pct: asNumber(entry.warmP50Pct),
        warmP95Pct: asNumber(entry.warmP95Pct),
        coldPct: asNumber(entry.coldPct),
        alerts: asStringArray(entry.alerts),
      }))
    : [];

  return {
    schemaVersion: "1.0",
    snapshotId: asString(value.snapshotId),
    generatedAt: asString(value.generatedAt),
    asOfDate: asString(value.asOfDate),
    owner: asString(value.owner),
    source: {
      repository: asString(source.repository),
      workflowName: asString(source.workflowName),
      workflowPath: asString(source.workflowPath),
      runId: asNumber(source.runId),
      runAttempt: asNumber(source.runAttempt),
      runUrl: asString(source.runUrl),
      eventName: asString(source.eventName),
      refName: asString(source.refName),
      sha: asString(source.sha),
      tier: asString(source.tier),
      runCount: asNumber(source.runCount),
      datasetVersion: asString(source.datasetVersion),
      runner: asString(source.runner),
      nodeVersion: asString(source.nodeVersion),
    },
    thresholds: {
      warmThresholdPct: asNumber(thresholds.warmThresholdPct),
      coldThresholdPct: asNumber(thresholds.coldThresholdPct),
      p95ThresholdPct: asNumber(thresholds.p95ThresholdPct),
      smallBaselineMs: asNumber(thresholds.smallBaselineMs),
      minAbsoluteDeltaMs: asNumber(thresholds.minAbsoluteDeltaMs),
    },
    summary: {
      totalPairs: asNumber(summary.totalPairs),
      alertCount: asNumber(summary.alertCount),
      hasAlerts: asBoolean(summary.hasAlerts),
      headValidationPassed: asBoolean(summary.headValidationPassed),
      baseValidationPassed: asBoolean(summary.baseValidationPassed),
    },
    benchmark: {
      profiles,
      scenarios,
      headline: {
        profileId: asString(headline.profileId),
        scenario: asString(headline.scenario),
      },
    },
    profileScenarioMetrics,
    deltas,
  };
}

function parseHistory(value: unknown): BenchmarkHistoryFile {
  const fallback: BenchmarkHistoryFile = {
    schemaVersion: "1.0",
    generatedAt: new Date(0).toISOString(),
    retention: 20,
    items: [],
  };

  if (!isRecord(value)) return fallback;
  if (asString(value.schemaVersion) !== "1.0") return fallback;

  const itemsRaw = Array.isArray(value.items) ? value.items : [];
  const items = itemsRaw
    .map(parseSnapshot)
    .filter((entry): entry is SiteBenchmarkSnapshot => entry !== null);

  return {
    schemaVersion: "1.0",
    generatedAt: asString(value.generatedAt, fallback.generatedAt),
    retention: asNumber(value.retention, fallback.retention),
    items,
  };
}

function resolveFixture() {
  const fixtureEnabled = process.env.BENCHMARK_ENABLE_LOCAL_FIXTURE === "1";
  const fixtureName = process.env.BENCHMARK_SNAPSHOT_FIXTURE;
  const isProdDeployment = process.env.VERCEL_ENV === "production";

  if (!fixtureEnabled || isProdDeployment || !fixtureName) {
    return null;
  }

  if (fixtureName === "sample") {
    return {
      latest: fixtureLatestSampleRaw,
      history: fixtureHistorySampleRaw,
    };
  }

  return null;
}

function resolveBenchmarkRawInputs() {
  const fixture = resolveFixture();
  if (fixture) {
    return fixture;
  }

  return {
    latest: latestRaw,
    history: historyRaw,
  };
}

export function getLatestBenchmarkSnapshot(): SiteBenchmarkSnapshot | null {
  return parseSnapshot(resolveBenchmarkRawInputs().latest);
}

export function getBenchmarkHistory(): SiteBenchmarkSnapshot[] {
  return parseHistory(resolveBenchmarkRawInputs().history).items;
}

export function getScenarioMetrics(
  snapshot: SiteBenchmarkSnapshot,
  profileId: string,
  scenario: string,
): BenchmarkScenarioMetrics | null {
  return snapshot.profileScenarioMetrics?.[profileId]?.[scenario] ?? null;
}
