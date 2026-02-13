import assert from "node:assert/strict";
import test from "node:test";

import { buildSummary, toMarkdown } from "../report.mjs";
import { validateReport } from "../types.mjs";

const checks = [
  {
    id: "technical.canonical",
    suite: "technical",
    severity: "critical",
    status: "fail",
    message: "Missing canonical",
    evidence: "app/layout.tsx",
    fixHint: "Add canonical",
    file: "app/layout.tsx",
  },
  {
    id: "content.copy_depth",
    suite: "content",
    severity: "medium",
    status: "warn",
    message: "Thin copy",
    evidence: "120 words",
    fixHint: "Add content",
    file: "app/page.tsx",
  },
];

test("buildSummary calculates weighted issue score", () => {
  const summary = buildSummary(checks);

  assert.equal(summary.critical, 1);
  assert.equal(summary.medium, 1);
  assert.equal(summary.score, 75);
});

test("toMarkdown includes required report sections", () => {
  const report = validateReport({
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    mode: "advisory",
    summary: buildSummary(checks),
    checks,
    opportunities: [
      {
        type: "content",
        priority: "high",
        title: "Add docs route",
        rationale: "Improve long-tail coverage",
        target: "app/docs/page.tsx",
      },
    ],
    dataSources: {
      public: true,
      gsc: false,
    },
  });

  const markdown = toMarkdown(report);

  assert.ok(markdown.includes("## Executive Summary"));
  assert.ok(markdown.includes("## Blocking Issues"));
  assert.ok(markdown.includes("## Highest-Impact Opportunities"));
  assert.ok(markdown.includes("## File-by-File Remediation Map"));
  assert.ok(markdown.includes("## Data Source Notes"));
});
