#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { buildEvaluation } from "./evaluation-contract.mjs";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function toNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

async function safeReadJson(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return {
      ok: true,
      value: JSON.parse(raw),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function evaluateSeoWeeklyReport({ periodKey, report }) {
  const checks = [];
  const notes = [];

  if (!report || typeof report !== "object") {
    checks.push({
      id: "seo-report-available",
      status: "fail",
      severity: "critical",
      message: "SEO report is missing or invalid JSON.",
      evidence: "report.json could not be parsed.",
    });

    return buildEvaluation({
      kind: "seo-weekly",
      periodKey,
      checks,
      notes,
    });
  }

  checks.push({
    id: "seo-report-available",
    status: "pass",
    severity: "critical",
    message: "SEO report loaded successfully.",
    evidence: "report.json parsed.",
  });

  const summary =
    typeof report.summary === "object" && report.summary !== null
      ? report.summary
      : null;

  const critical = toNonNegativeNumber(summary?.critical);
  const high = toNonNegativeNumber(summary?.high);
  const medium = toNonNegativeNumber(summary?.medium);
  const low = toNonNegativeNumber(summary?.low);
  const score = toNonNegativeNumber(summary?.score);

  if (critical === null) {
    checks.push({
      id: "seo-critical-count",
      status: "fail",
      severity: "critical",
      message: "SEO summary.critical is missing or invalid.",
      evidence: "Expected non-negative numeric summary.critical.",
    });
  } else {
    checks.push({
      id: "seo-critical-count",
      status: critical === 0 ? "pass" : "fail",
      severity: "critical",
      message:
        critical === 0
          ? "Critical issue count is zero."
          : `Critical issue count is ${critical.toString()}; must be zero for auto-close.`,
      evidence: `summary.critical=${critical.toString()}`,
    });
  }

  if (high !== null) {
    checks.push({
      id: "seo-high-count",
      status: high > 0 ? "warn" : "pass",
      severity: "high",
      message:
        high > 0
          ? `High advisories present (${high.toString()}).`
          : "No high advisories.",
      evidence: `summary.high=${high.toString()}`,
    });
  }

  if (medium !== null) {
    checks.push({
      id: "seo-medium-count",
      status: medium > 0 ? "warn" : "pass",
      severity: "medium",
      message:
        medium > 0
          ? `Medium advisories present (${medium.toString()}).`
          : "No medium advisories.",
      evidence: `summary.medium=${medium.toString()}`,
    });
  }

  if (low !== null) {
    checks.push({
      id: "seo-low-count",
      status: low > 0 ? "warn" : "pass",
      severity: "low",
      message:
        low > 0
          ? `Low advisories present (${low.toString()}).`
          : "No low advisories.",
      evidence: `summary.low=${low.toString()}`,
    });
  }

  if (score !== null) {
    notes.push(`SEO score: ${score.toString()}/100`);
  }

  return buildEvaluation({
    kind: "seo-weekly",
    periodKey,
    checks,
    notes,
  });
}

export async function runEvaluateSeoWeekly({
  reportPath,
  periodKey,
  outputPath,
  rule,
}) {
  if (rule !== "critical-only") {
    throw new Error(`Unsupported rule '${rule}'. Expected 'critical-only'.`);
  }

  const reportResult = await safeReadJson(reportPath);
  const evaluation = evaluateSeoWeeklyReport({
    periodKey,
    report: reportResult.ok ? reportResult.value : null,
  });

  if (!reportResult.ok) {
    evaluation.notes.push(`Report parse error: ${reportResult.error}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(evaluation, null, 2)}\n`,
    "utf8",
  );

  return evaluation;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  const reportPath =
    typeof args.report === "string" ? path.resolve(args.report) : "";
  const periodKey =
    typeof args["period-key"] === "string" ? args["period-key"] : "";
  const outputPath =
    typeof args.output === "string" ? path.resolve(args.output) : "";
  const rule = typeof args.rule === "string" ? args.rule : "critical-only";

  if (!reportPath) {
    throw new Error("--report is required.");
  }
  if (!periodKey) {
    throw new Error("--period-key is required.");
  }
  if (!outputPath) {
    throw new Error("--output is required.");
  }

  const evaluation = await runEvaluateSeoWeekly({
    reportPath,
    periodKey,
    outputPath,
    rule,
  });

  process.stdout.write(`${JSON.stringify(evaluation)}\n`);
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
