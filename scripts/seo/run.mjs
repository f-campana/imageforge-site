#!/usr/bin/env node
import { loadConfig } from "./config.mjs";
import { runContentChecks } from "./content.mjs";
import { runGscChecks } from "./gsc.mjs";
import { runOffpageChecks } from "./offpage.mjs";
import { buildSummary, writeReport } from "./report.mjs";
import { runTechnicalChecks } from "./technical.mjs";
import { validateReport } from "./types.mjs";

async function main() {
  const config = loadConfig();

  const checks = [];
  const opportunities = [];
  let gscEnabled = false;

  if (config.suite === "tech" || config.suite === "full") {
    const technical = await runTechnicalChecks(config);
    checks.push(...technical.checks);
    opportunities.push(...technical.opportunities);
  }

  if (config.suite === "content" || config.suite === "full") {
    const content = await runContentChecks(config);
    checks.push(...content.checks);
    opportunities.push(...content.opportunities);
  }

  if (config.suite === "offpage" || config.suite === "full") {
    const offpage = await runOffpageChecks(config);
    checks.push(...offpage.checks);
    opportunities.push(...offpage.opportunities);
  }

  if (config.suite === "full") {
    const gsc = await runGscChecks(config);
    checks.push(...gsc.checks);
    opportunities.push(...gsc.opportunities);
    gscEnabled = gsc.enabled;
  }

  const report = validateReport({
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    mode: config.mode,
    summary: buildSummary(checks),
    checks,
    opportunities,
    dataSources: {
      public: true,
      gsc: gscEnabled,
    },
  });

  const output = await writeReport(report, config.outputDir);

  const criticalFailures = report.checks.filter(
    (check) => check.severity === "critical" && check.status === "fail",
  ).length;

  console.log(`SEO report written to ${output.markdownPath}`);
  console.log(
    `Summary: critical=${report.summary.critical}, high=${report.summary.high}, medium=${report.summary.medium}, low=${report.summary.low}, score=${report.summary.score}`,
  );

  if (config.mode === "strict" && criticalFailures > 0) {
    console.error(
      `Strict mode failed: ${criticalFailures} critical issue(s) detected.`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
