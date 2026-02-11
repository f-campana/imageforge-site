import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

function countIssues(checks, severity) {
  return checks.filter(
    (check) => check.severity === severity && ["fail", "warn"].includes(check.status),
  ).length;
}

export function buildSummary(checks) {
  const critical = countIssues(checks, "critical");
  const high = countIssues(checks, "high");
  const medium = countIssues(checks, "medium");
  const low = countIssues(checks, "low");

  const penalty = critical * 20 + high * 10 + medium * 5 + low * 2;

  return {
    critical,
    high,
    medium,
    low,
    score: Math.max(0, Math.min(100, 100 - penalty)),
  };
}

function formatCheck(check) {
  return `- [${check.status.toUpperCase()}] ${check.id} (${check.severity}): ${check.message}`;
}

function buildRemediationMap(checks) {
  const groups = new Map();

  for (const check of checks.filter((item) => ["fail", "warn"].includes(item.status))) {
    const file = check.file ?? "(no file)";
    if (!groups.has(file)) {
      groups.set(file, []);
    }

    groups.get(file).push(check);
  }

  return groups;
}

export function toMarkdown(report) {
  const blocking = report.checks.filter(
    (check) => check.severity === "critical" && check.status === "fail",
  );

  const topOpportunities = report.opportunities.slice(0, 8);
  const remediationMap = buildRemediationMap(report.checks);

  const lines = [
    "# SEO Audit Report",
    "",
    "## Executive Summary",
    `- Generated: ${report.generatedAt}`,
    `- Mode: ${report.mode}`,
    `- Score: ${report.summary.score}/100`,
    `- Issues: critical=${report.summary.critical}, high=${report.summary.high}, medium=${report.summary.medium}, low=${report.summary.low}`,
    `- Data sources: public=${report.dataSources.public}, gsc=${report.dataSources.gsc}`,
    "",
    "## Blocking Issues",
  ];

  if (blocking.length === 0) {
    lines.push("- None");
  } else {
    lines.push(...blocking.map(formatCheck));
  }

  lines.push("", "## Highest-Impact Opportunities");

  if (topOpportunities.length === 0) {
    lines.push("- None");
  } else {
    for (const opportunity of topOpportunities) {
      lines.push(
        `- [${opportunity.priority.toUpperCase()}] ${opportunity.title} -> ${opportunity.target}`,
      );
      lines.push(`  Rationale: ${opportunity.rationale}`);
    }
  }

  lines.push("", "## File-by-File Remediation Map");

  if (remediationMap.size === 0) {
    lines.push("- No remediation items.");
  } else {
    for (const [file, checks] of remediationMap.entries()) {
      lines.push(`- ${file}`);
      for (const check of checks) {
        lines.push(`  - ${check.id}: ${check.fixHint}`);
      }
    }
  }

  lines.push(
    "",
    "## Data Source Notes",
    "- Public: Crawlable HTTP and source-level checks.",
    "- GSC: Included only when credentials are configured.",
  );

  return lines.join("\n");
}

export async function writeReport(report, outputDir) {
  await mkdir(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, "report.json");
  const markdownPath = path.join(outputDir, "report.md");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, `${toMarkdown(report)}\n`, "utf8");

  return {
    jsonPath,
    markdownPath,
  };
}
