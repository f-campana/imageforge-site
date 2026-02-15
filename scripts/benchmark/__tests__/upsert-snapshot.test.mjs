import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
);
const UPSERT = path.join(ROOT, "benchmark", "upsert-snapshot.mjs");

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

function makeSnapshot(snapshotId, runId) {
  return {
    schemaVersion: "1.0",
    snapshotId,
    generatedAt: "2026-02-15T00:00:00.000Z",
    asOfDate: "February 15, 2026",
    owner: "ImageForge Maintainers (CLI + Growth)",
    source: {
      repository: "f-campana/imageforge",
      workflowName: "Benchmark CI",
      workflowPath: ".github/workflows/benchmark-ci.yml",
      runId,
      runAttempt: 1,
      runUrl: `https://github.com/f-campana/imageforge/actions/runs/${runId.toString()}`,
      eventName: "schedule",
      refName: "main",
      sha: "abcdef123",
      tier: "tier200",
      runCount: 10,
      datasetVersion: "1.0.0",
      runner: "ubuntu-24.04",
      nodeVersion: "22",
    },
    thresholds: {
      warmThresholdPct: 10,
      coldThresholdPct: 15,
      p95ThresholdPct: 20,
      smallBaselineMs: 100,
      minAbsoluteDeltaMs: 15,
    },
    summary: {
      totalPairs: 12,
      alertCount: 0,
      hasAlerts: false,
      headValidationPassed: true,
      baseValidationPassed: true,
    },
    benchmark: {
      profiles: [],
      scenarios: [],
      headline: {
        profileId: "P2",
        scenario: "batch-all",
      },
    },
    profileScenarioMetrics: {},
    deltas: [],
  };
}

test("upsert snapshot writes latest and history with dedupe + retention", () => {
  const tempDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-site-bench-test-"),
  );
  const latestPath = path.join(tempDir, "latest.json");
  const historyPath = path.join(tempDir, "history.json");
  const snapAPath = path.join(tempDir, "snap-a.json");
  const snapBPath = path.join(tempDir, "snap-b.json");

  writeJson(snapAPath, makeSnapshot("100.1", 100));
  writeJson(snapBPath, makeSnapshot("101.1", 101));

  const first = spawnSync(
    "node",
    [
      UPSERT,
      "--snapshot",
      snapAPath,
      "--latest",
      latestPath,
      "--history",
      historyPath,
      "--retention",
      "2",
    ],
    { encoding: "utf-8" },
  );
  assert.equal(first.status, 0);

  const second = spawnSync(
    "node",
    [
      UPSERT,
      "--snapshot",
      snapBPath,
      "--latest",
      latestPath,
      "--history",
      historyPath,
      "--retention",
      "2",
    ],
    { encoding: "utf-8" },
  );
  assert.equal(second.status, 0);

  const latest = JSON.parse(readFileSync(latestPath, "utf-8"));
  const history = JSON.parse(readFileSync(historyPath, "utf-8"));

  assert.equal(latest.snapshotId, "101.1");
  assert.equal(history.items.length, 2);
  assert.equal(history.items[0].snapshotId, "101.1");
  assert.equal(history.items[1].snapshotId, "100.1");

  const dedupe = spawnSync(
    "node",
    [
      UPSERT,
      "--snapshot",
      snapBPath,
      "--latest",
      latestPath,
      "--history",
      historyPath,
      "--retention",
      "2",
    ],
    { encoding: "utf-8" },
  );
  assert.equal(dedupe.status, 0);

  const historyAfterDedupe = JSON.parse(readFileSync(historyPath, "utf-8"));
  assert.equal(historyAfterDedupe.items.length, 2);
  assert.equal(historyAfterDedupe.items[0].snapshotId, "101.1");
});
