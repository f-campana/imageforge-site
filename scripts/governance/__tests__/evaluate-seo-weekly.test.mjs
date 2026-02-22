import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  evaluateSeoWeeklyReport,
  runEvaluateSeoWeekly,
} from "../evaluate-seo-weekly.mjs";

test("evaluateSeoWeeklyReport passes when critical is zero and keeps advisories as warn", () => {
  const evaluation = evaluateSeoWeeklyReport({
    periodKey: "2026-W08",
    report: {
      summary: {
        critical: 0,
        high: 1,
        medium: 2,
        low: 1,
        score: 90,
      },
    },
  });

  assert.equal(evaluation.result, "pass");
  assert.equal(evaluation.blockingFailures, 0);

  const criticalCheck = evaluation.checks.find(
    (check) => check.id === "seo-critical-count",
  );
  assert.equal(criticalCheck?.status, "pass");

  const highCheck = evaluation.checks.find(
    (check) => check.id === "seo-high-count",
  );
  assert.equal(highCheck?.status, "warn");
});

test("runEvaluateSeoWeekly writes failing evaluation when report is missing", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-seo-weekly-"));
  const outputPath = path.join(tempDir, "evaluation.json");

  const evaluation = await runEvaluateSeoWeekly({
    reportPath: path.join(tempDir, "missing.json"),
    periodKey: "2026-W08",
    outputPath,
    rule: "critical-only",
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) => check.id === "seo-report-available" && check.status === "fail",
    ),
  );

  const persisted = JSON.parse(await readFile(outputPath, "utf8"));
  assert.equal(persisted.result, "fail");
});

test("runEvaluateSeoWeekly throws on unsupported rule", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-seo-weekly-"));
  const reportPath = path.join(tempDir, "report.json");
  const outputPath = path.join(tempDir, "evaluation.json");

  writeFileSync(
    reportPath,
    JSON.stringify({ summary: { critical: 0, high: 0, medium: 0, low: 0 } }),
  );

  await assert.rejects(
    () =>
      runEvaluateSeoWeekly({
        reportPath,
        periodKey: "2026-W08",
        outputPath,
        rule: "all-zero",
      }),
    /Unsupported rule/u,
  );
});
