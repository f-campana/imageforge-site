export type BenchmarkProfile = {
  id: string;
  formats: string;
  quality: number;
  blur: boolean;
  widths: string | null;
  description: string;
};

export type BenchmarkScenario = {
  name: string;
  expectedTotal: number;
};

export type BenchmarkScenarioMetrics = {
  runCount: number;
  imageCount: number;
  coldWallMs: number;
  warmMeanMs: number;
  warmP50Ms: number;
  warmP95Ms: number;
  warmStddevMs: number;
  speedup: number;
  coldImagesPerSec: number;
  warmImagesPerSec: number;
  coldPerImageMs: number;
  warmPerImageMs: number;
  coldOriginalBytes: number;
  coldProcessedBytes: number;
  validationPassed: boolean;
};

export type BenchmarkDelta = {
  profileId: string;
  scenario: string;
  warmP50Pct: number;
  warmP95Pct: number;
  coldPct: number;
  alerts: string[];
};

export type SiteBenchmarkSnapshot = {
  schemaVersion: "1.0";
  snapshotId: string;
  generatedAt: string;
  asOfDate: string;
  owner: string;
  source: {
    repository: string;
    workflowName: string;
    workflowPath: string;
    runId: number;
    runAttempt: number;
    runUrl: string;
    eventName: string;
    refName: string;
    sha: string;
    tier: string;
    runCount: number;
    datasetVersion: string;
    runner: string;
    nodeVersion: string;
  };
  thresholds: {
    warmThresholdPct: number;
    coldThresholdPct: number;
    p95ThresholdPct: number;
    smallBaselineMs: number;
    minAbsoluteDeltaMs: number;
  };
  summary: {
    totalPairs: number;
    alertCount: number;
    hasAlerts: boolean;
    headValidationPassed: boolean;
    baseValidationPassed: boolean;
  };
  benchmark: {
    profiles: BenchmarkProfile[];
    scenarios: BenchmarkScenario[];
    headline: {
      profileId: string;
      scenario: string;
    };
  };
  profileScenarioMetrics: Record<
    string,
    Record<string, BenchmarkScenarioMetrics>
  >;
  deltas: BenchmarkDelta[];
};

export type BenchmarkHistoryFile = {
  schemaVersion: "1.0";
  generatedAt: string;
  retention: number;
  items: SiteBenchmarkSnapshot[];
};
