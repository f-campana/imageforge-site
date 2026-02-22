import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { evaluateClaimsMonthly } from "../evaluate-claims-monthly.mjs";

const CLI_SHA = "022957c640615c3abb45d1a7e3fb4cba961be558";
const BENCHMARK_COMMIT = "b561d4e809a546a6220b7e08c85dfd8ff0beae79";

function writeFixtureFile(rootDir, relativePath, contents) {
  const absolutePath = path.join(rootDir, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, "utf8");
}

function createFixtureRoot({
  pricingAsOf = "February 11, 2026",
  pricingOwner = "ImageForge Maintainers (Product + Growth)",
  claimSha = CLI_SHA,
  benchmarkGeneratedAt = "2026-02-20T03:21:54.350Z",
} = {}) {
  const rootDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-claims-monthly-"),
  );

  writeFixtureFile(
    rootDir,
    "components/landing/constants.ts",
    `export const PRICING_AS_OF = "${pricingAsOf}";\nexport const PRICING_OWNER = "${pricingOwner}";\nexport const PRICING_SOURCES = [\n  { id: "one", label: "One", url: "https://pricing-one.example" },\n  { id: "two", label: "Two", url: "https://pricing-two.example" },\n];\n`,
  );

  writeFixtureFile(
    rootDir,
    "components/landing/benchmark-evidence.ts",
    "import { getLatestBenchmarkSnapshot, getScenarioMetrics } from '@/lib/benchmark/load';\nconst x = latest?.source.runUrl;\n",
  );

  writeFixtureFile(
    rootDir,
    "docs/pr-diff-audit-agents/cli-contract-pin.md",
    `Pinned SHA: \`${CLI_SHA}\`\n`,
  );

  writeFixtureFile(
    rootDir,
    "docs/pr-diff-audit-agents/claim-matrix.md",
    `Evidence pinned to \`${claimSha}\`\n`,
  );

  writeFixtureFile(
    rootDir,
    "data/benchmarks/latest.json",
    `${JSON.stringify(
      {
        schemaVersion: "1.0",
        snapshotId: "22209835535.1",
        generatedAt: benchmarkGeneratedAt,
        asOfDate: "February 20, 2026",
        owner: "ImageForge Maintainers (CLI + Growth)",
        source: {
          runUrl:
            "https://github.com/f-campana/imageforge/actions/runs/22209835535",
        },
        summary: {
          totalPairs: 12,
        },
      },
      null,
      2,
    )}\n`,
  );

  return rootDir;
}

function makeRunCommand({ buildStatus = 0 } = {}) {
  return (command, args) => {
    if (command === "git") {
      assert.deepEqual(args, [
        "log",
        "-n",
        "1",
        "--format=%H",
        "--",
        "data/benchmarks/latest.json",
      ]);
      return {
        status: 0,
        stdout: `${BENCHMARK_COMMIT}\n`,
        stderr: "",
      };
    }

    if (command === "pnpm") {
      return {
        status: buildStatus,
        stdout: buildStatus === 0 ? "build ok" : "build failed",
        stderr: buildStatus === 0 ? "" : "error",
      };
    }

    return {
      status: 1,
      stdout: "",
      stderr: `unsupported command: ${command}`,
    };
  };
}

function makeFetch({
  failPricingUrls = false,
  noLineage = false,
  headFallback = false,
} = {}) {
  return async (url, options = {}) => {
    const method = options.method ?? "GET";

    if (url === "https://pricing-one.example") {
      if (headFallback && method === "HEAD") {
        return new Response("", { status: 405 });
      }
      if (headFallback && method === "GET") {
        return new Response("", { status: 200 });
      }
      return new Response("", { status: failPricingUrls ? 503 : 200 });
    }

    if (url === "https://pricing-two.example") {
      return new Response("", { status: failPricingUrls ? 503 : 200 });
    }

    if (
      url ===
      `https://api.github.com/repos/f-campana/imageforge-site/commits/${BENCHMARK_COMMIT}/pulls?per_page=100`
    ) {
      const pulls = noLineage
        ? []
        : [
            {
              number: 29,
              merged_at: "2026-02-20T13:14:28Z",
              base: { ref: "main" },
              title: "chore(benchmark): sync nightly benchmark snapshot",
              head: { ref: "codex/benchmark-sync-nightly" },
            },
          ];
      return new Response(JSON.stringify(pulls), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    if (
      url ===
      "https://api.github.com/repos/f-campana/imageforge-site/pulls/29/files?per_page=100"
    ) {
      return new Response(
        JSON.stringify([{ filename: "data/benchmarks/latest.json" }]),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }

    throw new Error(`Unexpected URL in fetch mock: ${url} (${method})`);
  };
}

test("evaluateClaimsMonthly passes with objective checks and HEAD->GET fallback", async () => {
  const rootDir = createFixtureRoot();

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch({ headFallback: true }),
    runCommandImpl: makeRunCommand(),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "pass");
  assert.equal(evaluation.blockingFailures, 0);
});

test("evaluateClaimsMonthly fails when pricing as-of date is stale", async () => {
  const rootDir = createFixtureRoot({ pricingAsOf: "January 01, 2025" });

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch(),
    runCommandImpl: makeRunCommand(),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "pricing-as-of-freshness" && check.status === "fail",
    ),
  );
});

test("evaluateClaimsMonthly fails when benchmark snapshot is stale", async () => {
  const rootDir = createFixtureRoot({
    benchmarkGeneratedAt: "2025-12-01T00:00:00.000Z",
  });

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch(),
    runCommandImpl: makeRunCommand(),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "benchmark-latest-freshness" && check.status === "fail",
    ),
  );
});

test("evaluateClaimsMonthly fails when pricing links are unreachable after retries", async () => {
  const rootDir = createFixtureRoot();

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch({ failPricingUrls: true }),
    runCommandImpl: makeRunCommand(),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "pricing-sources-reachable" && check.status === "fail",
    ),
  );
});

test("evaluateClaimsMonthly fails when benchmark lineage proof is missing", async () => {
  const rootDir = createFixtureRoot();

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch({ noLineage: true }),
    runCommandImpl: makeRunCommand(),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "benchmark-lineage-associated-pr" &&
        check.status === "fail",
    ),
  );
});

test("evaluateClaimsMonthly fails on contract pin mismatch and build failure", async () => {
  const rootDir = createFixtureRoot({
    claimSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  });

  const evaluation = await evaluateClaimsMonthly({
    periodKey: "2026-02",
    freshnessBenchmarkDays: 14,
    freshnessPricingDays: 45,
    rootDir,
    token: "token",
    repository: "f-campana/imageforge-site",
    fetchImpl: makeFetch(),
    runCommandImpl: makeRunCommand({ buildStatus: 1 }),
    now: new Date("2026-02-22T00:00:00.000Z"),
  });

  assert.equal(evaluation.result, "fail");
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "contract-pin-alignment" && check.status === "fail",
    ),
  );
  assert.ok(
    evaluation.checks.some(
      (check) =>
        check.id === "benchmark-build-safety" && check.status === "fail",
    ),
  );
});
