#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  listPullRequestFiles,
  listPullRequestsForCommit,
  splitRepository,
} from "./github-api.mjs";
import { buildEvaluation } from "./evaluation-contract.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;
const BENCHMARK_RELATIVE_PATH = "data/benchmarks/latest.json";

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

function toInteger(value, fallback) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(number) ? number : fallback;
}

function ageInDays(date, now) {
  const ageMs = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(ageMs / DAY_MS));
}

function tailLines(text, maxLines = 20) {
  const lines = String(text ?? "").trim().split(/\r?\n/u);
  return lines.slice(-maxLines).join("\n");
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

function parsePricingConstants(source) {
  const asOfMatch = source.match(/export const PRICING_AS_OF\s*=\s*"([^"]+)";/u);
  const ownerMatch = source.match(
    /export const PRICING_OWNER\s*=\s*"([^"]+)";/u,
  );

  const sourcesBlockMatch = source.match(
    /export const PRICING_SOURCES[\s\S]*?\n\];/u,
  );
  const block = sourcesBlockMatch?.[0] ?? "";

  const urls = [...block.matchAll(/url:\s*"([^"]+)"/gu)].map(
    (match) => match[1],
  );

  return {
    pricingAsOf: asOfMatch?.[1] ?? "",
    pricingOwner: ownerMatch?.[1] ?? "",
    pricingUrls: urls,
  };
}

function extractShaCandidates(source) {
  return [...source.matchAll(/\b([a-f0-9]{40})\b/giu)].map((match) =>
    match[1].toLowerCase(),
  );
}

async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isSuccessStatus(status) {
  return status >= 200 && status < 400;
}

function isMethodNotSupported(status) {
  return status === 405 || status === 501;
}

function isRetriableStatus(status) {
  return status === 429 || status >= 500;
}

async function requestUrl(url, method, timeoutMs, fetchImpl) {
  try {
    const response = await fetchImpl(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });

    return {
      ok: isSuccessStatus(response.status),
      status: response.status,
      error: null,
      method,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : String(error),
      method,
    };
  }
}

export async function checkUrlReachableWithPolicy(
  url,
  {
    fetchImpl = fetch,
    timeoutMs = 8000,
    retries = 3,
    backoffMs = [1000, 2000, 4000],
  } = {},
) {
  let lastResult = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const headResult = await requestUrl(url, "HEAD", timeoutMs, fetchImpl);
    lastResult = headResult;

    if (headResult.ok) {
      return {
        ok: true,
        url,
        attempt,
        method: "HEAD",
        status: headResult.status,
        error: null,
      };
    }

    if (headResult.status !== null && isMethodNotSupported(headResult.status)) {
      const getResult = await requestUrl(url, "GET", timeoutMs, fetchImpl);
      lastResult = getResult;
      if (getResult.ok) {
        return {
          ok: true,
          url,
          attempt,
          method: "GET",
          status: getResult.status,
          error: null,
        };
      }
    }

    const retryStatus = lastResult?.status ?? null;
    const shouldRetry =
      retryStatus === null ||
      (retryStatus !== null && isRetriableStatus(retryStatus));

    if (attempt < retries && shouldRetry) {
      await sleep(backoffMs[attempt - 1] ?? backoffMs.at(-1) ?? 1000);
    }
  }

  return {
    ok: false,
    url,
    attempt: retries,
    method: lastResult?.method ?? "HEAD",
    status: lastResult?.status ?? null,
    error: lastResult?.error ?? "unreachable",
  };
}

function latestCommitTouchingPath(targetRelativePath, cwd, runCommandImpl) {
  const result = runCommandImpl(
    "git",
    ["log", "-n", "1", "--format=%H", "--", targetRelativePath],
    { cwd },
  );

  if (result.status !== 0) {
    return {
      ok: false,
      sha: "",
      error: tailLines(`${result.stdout}\n${result.stderr}`) || "git log failed",
    };
  }

  const sha = result.stdout.trim();
  if (!sha) {
    return {
      ok: false,
      sha: "",
      error: `No commit found for path '${targetRelativePath}'.`,
    };
  }

  return {
    ok: true,
    sha,
    error: null,
  };
}

function runBuildSafetyCheck(rootDir, runCommandImpl) {
  const result = runCommandImpl("pnpm", ["build"], {
    cwd: rootDir,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    },
  });

  if (result.error) {
    return {
      ok: false,
      evidence: result.error.message,
    };
  }

  if (result.status === 0) {
    return {
      ok: true,
      evidence: "pnpm build exited 0 with NEXT_PUBLIC_SITE_URL=https://example.com",
    };
  }

  return {
    ok: false,
    evidence: `pnpm build exit code ${result.status.toString()}\n${tailLines(`${result.stdout}\n${result.stderr}`)}`,
  };
}

function pushCheck(checks, check) {
  checks.push(check);
}

export async function evaluateClaimsMonthly({
  periodKey,
  freshnessBenchmarkDays,
  freshnessPricingDays,
  rootDir = process.cwd(),
  token = process.env.GITHUB_TOKEN?.trim() ?? "",
  repository = process.env.GITHUB_REPOSITORY?.trim() ?? "",
  fetchImpl = fetch,
  runCommandImpl = runCommand,
  now = new Date(),
}) {
  const checks = [];
  const notes = [];

  const constantsPath = path.join(rootDir, "components/landing/constants.ts");
  const benchmarkLatestPath = path.join(rootDir, BENCHMARK_RELATIVE_PATH);
  const benchmarkEvidencePath = path.join(
    rootDir,
    "components/landing/benchmark-evidence.ts",
  );
  const cliContractPinPath = path.join(
    rootDir,
    "docs/pr-diff-audit-agents/cli-contract-pin.md",
  );
  const claimMatrixPath = path.join(
    rootDir,
    "docs/pr-diff-audit-agents/claim-matrix.md",
  );

  let pricingAsOf = "";
  let pricingOwner = "";
  let pricingUrls = [];

  try {
    const constantsSource = await readFile(constantsPath, "utf8");
    const parsed = parsePricingConstants(constantsSource);
    pricingAsOf = parsed.pricingAsOf;
    pricingOwner = parsed.pricingOwner;
    pricingUrls = parsed.pricingUrls;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    pushCheck(checks, {
      id: "pricing-constants-parse",
      status: "fail",
      severity: "critical",
      message: "Failed to read pricing constants file.",
      evidence: message,
    });
  }

  if (pricingAsOf) {
    const parsedDate = new Date(pricingAsOf);
    if (Number.isNaN(parsedDate.getTime())) {
      pushCheck(checks, {
        id: "pricing-as-of-freshness",
        status: "fail",
        severity: "critical",
        message: "PRICING_AS_OF could not be parsed as a date.",
        evidence: `PRICING_AS_OF='${pricingAsOf}'`,
      });
    } else {
      const ageDays = ageInDays(parsedDate, now);
      pushCheck(checks, {
        id: "pricing-as-of-freshness",
        status: ageDays <= freshnessPricingDays ? "pass" : "fail",
        severity: "critical",
        message:
          ageDays <= freshnessPricingDays
            ? "Pricing as-of date is within freshness threshold."
            : "Pricing as-of date exceeds freshness threshold.",
        evidence: `asOf='${pricingAsOf}', ageDays=${ageDays.toString()}, thresholdDays=${freshnessPricingDays.toString()}`,
      });
    }
  } else {
    pushCheck(checks, {
      id: "pricing-as-of-freshness",
      status: "fail",
      severity: "critical",
      message: "PRICING_AS_OF is missing.",
      evidence: "Expected export const PRICING_AS_OF in constants.ts",
    });
  }

  pushCheck(checks, {
    id: "pricing-owner-present",
    status: pricingOwner.trim() ? "pass" : "fail",
    severity: "critical",
    message: pricingOwner.trim()
      ? "PRICING_OWNER is present."
      : "PRICING_OWNER is missing or empty.",
    evidence: pricingOwner.trim() || "(empty)",
  });

  if (pricingUrls.length === 0) {
    pushCheck(checks, {
      id: "pricing-sources-reachable",
      status: "fail",
      severity: "critical",
      message: "No pricing source URLs were extracted.",
      evidence: "Expected PRICING_SOURCES urls in constants.ts",
    });
  } else {
    const results = await Promise.all(
      pricingUrls.map((url) => checkUrlReachableWithPolicy(url, { fetchImpl })),
    );

    const failures = results.filter((result) => !result.ok);
    const evidence = results
      .map((result) => {
        const statusPart =
          result.status === null ? "status=none" : `status=${result.status.toString()}`;
        const errorPart = result.error ? ` error=${result.error}` : "";
        return `${result.url} method=${result.method} ${statusPart}${errorPart}`;
      })
      .join(" | ");

    pushCheck(checks, {
      id: "pricing-sources-reachable",
      status: failures.length === 0 ? "pass" : "fail",
      severity: "critical",
      message:
        failures.length === 0
          ? "All pricing source URLs are reachable."
          : `${failures.length.toString()} pricing source URL(s) are unreachable.`,
      evidence,
    });
  }

  let latestSnapshot = null;

  try {
    const benchmarkRaw = await readFile(benchmarkLatestPath, "utf8");
    const parsed = JSON.parse(benchmarkRaw);
    const requiredRoot = [
      "snapshotId",
      "generatedAt",
      "asOfDate",
      "owner",
      "source",
      "summary",
    ];
    const missing = requiredRoot.filter(
      (key) => parsed[key] === undefined || parsed[key] === null,
    );

    if (parsed.schemaVersion !== "1.0" || missing.length > 0) {
      pushCheck(checks, {
        id: "benchmark-latest-schema",
        status: "fail",
        severity: "critical",
        message: "Benchmark latest snapshot schema validation failed.",
        evidence: `schemaVersion='${String(parsed.schemaVersion ?? "")}', missing=[${missing.join(",")}]`,
      });
    } else {
      latestSnapshot = parsed;
      pushCheck(checks, {
        id: "benchmark-latest-schema",
        status: "pass",
        severity: "critical",
        message: "Benchmark latest snapshot schema is valid.",
        evidence: `snapshotId='${String(parsed.snapshotId)}'`,
      });
    }
  } catch (error) {
    pushCheck(checks, {
      id: "benchmark-latest-schema",
      status: "fail",
      severity: "critical",
      message: "Failed to parse benchmark latest snapshot JSON.",
      evidence: error instanceof Error ? error.message : String(error),
    });
  }

  if (latestSnapshot?.generatedAt) {
    const generatedAt = new Date(String(latestSnapshot.generatedAt));
    if (Number.isNaN(generatedAt.getTime())) {
      pushCheck(checks, {
        id: "benchmark-latest-freshness",
        status: "fail",
        severity: "critical",
        message: "Benchmark generatedAt is invalid.",
        evidence: `generatedAt='${String(latestSnapshot.generatedAt)}'`,
      });
    } else {
      const ageDays = ageInDays(generatedAt, now);
      pushCheck(checks, {
        id: "benchmark-latest-freshness",
        status: ageDays <= freshnessBenchmarkDays ? "pass" : "fail",
        severity: "critical",
        message:
          ageDays <= freshnessBenchmarkDays
            ? "Benchmark snapshot is within freshness threshold."
            : "Benchmark snapshot exceeds freshness threshold.",
        evidence: `generatedAt='${generatedAt.toISOString()}', ageDays=${ageDays.toString()}, thresholdDays=${freshnessBenchmarkDays.toString()}`,
      });
    }
  } else {
    pushCheck(checks, {
      id: "benchmark-latest-freshness",
      status: "fail",
      severity: "critical",
      message: "Benchmark generatedAt is missing.",
      evidence: "generatedAt missing from latest snapshot.",
    });
  }

  const latestCommit = latestCommitTouchingPath(
    BENCHMARK_RELATIVE_PATH,
    rootDir,
    runCommandImpl,
  );

  let lineageMatchedPulls = [];

  if (!latestCommit.ok) {
    pushCheck(checks, {
      id: "benchmark-lineage-associated-pr",
      status: "fail",
      severity: "critical",
      message: "Could not determine latest benchmark snapshot commit.",
      evidence: latestCommit.error,
    });
  } else if (!token || !repository) {
    pushCheck(checks, {
      id: "benchmark-lineage-associated-pr",
      status: "fail",
      severity: "critical",
      message: "Missing GitHub context required for lineage check.",
      evidence: "Expected GITHUB_TOKEN and GITHUB_REPOSITORY.",
    });
  } else {
    try {
      const { owner, repo } = splitRepository(repository);
      const pulls = await listPullRequestsForCommit({
        owner,
        repo,
        commitSha: latestCommit.sha,
        token,
        fetchImpl,
      });

      const mergedMainPulls = pulls.filter(
        (pull) => pull.merged_at && pull.base?.ref === "main",
      );

      for (const pull of mergedMainPulls) {
        const files = await listPullRequestFiles({
          owner,
          repo,
          pullNumber: pull.number,
          token,
          fetchImpl,
        });

        const touchesBenchmarkFile = files.some(
          (file) => file.filename === BENCHMARK_RELATIVE_PATH,
        );

        if (touchesBenchmarkFile) {
          lineageMatchedPulls.push(pull);
        }
      }

      pushCheck(checks, {
        id: "benchmark-lineage-associated-pr",
        status: lineageMatchedPulls.length > 0 ? "pass" : "fail",
        severity: "critical",
        message:
          lineageMatchedPulls.length > 0
            ? "Benchmark snapshot commit is linked to merged PR lineage on main."
            : "No merged PR on main proved lineage for latest benchmark snapshot commit.",
        evidence:
          lineageMatchedPulls.length > 0
            ? lineageMatchedPulls
                .map((pull) => `#${pull.number.toString()}`)
                .join(", ")
            : `commit=${latestCommit.sha}`,
      });
    } catch (error) {
      pushCheck(checks, {
        id: "benchmark-lineage-associated-pr",
        status: "fail",
        severity: "critical",
        message: "Benchmark lineage check failed while querying GitHub API.",
        evidence: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const namingMatches = lineageMatchedPulls.some((pull) => {
    const title = String(pull.title ?? "");
    const headRef = String(pull.head?.ref ?? "");
    return (
      /^chore\(benchmark\): sync nightly benchmark snapshot/iu.test(title) ||
      /^codex\/benchmark-sync-nightly/iu.test(headRef)
    );
  });

  pushCheck(checks, {
    id: "benchmark-lineage-naming-convention",
    status:
      lineageMatchedPulls.length === 0
        ? "warn"
        : namingMatches
          ? "pass"
          : "warn",
    severity: "low",
    message:
      lineageMatchedPulls.length === 0
        ? "Naming advisory skipped because lineage proof failed."
        : namingMatches
          ? "Lineage PR naming convention matched expected benchmark sync pattern."
          : "Lineage PR exists, but naming convention did not match expected benchmark sync pattern.",
    evidence:
      lineageMatchedPulls.length === 0
        ? "No lineage PR available."
        : lineageMatchedPulls
            .map(
              (pull) =>
                `#${pull.number.toString()} title='${String(pull.title ?? "")}' head='${String(pull.head?.ref ?? "")}'`,
            )
            .join(" | "),
  });

  try {
    const evidenceSource = await readFile(benchmarkEvidencePath, "utf8");
    const requiredSignals = [
      "getLatestBenchmarkSnapshot",
      "getScenarioMetrics",
      "latest?.source.runUrl",
    ];
    const missingSignals = requiredSignals.filter(
      (signal) => !evidenceSource.includes(signal),
    );

    pushCheck(checks, {
      id: "benchmark-evidence-guardrails",
      status: missingSignals.length === 0 ? "pass" : "fail",
      severity: "critical",
      message:
        missingSignals.length === 0
          ? "Benchmark evidence derivation guardrails are present."
          : "Benchmark evidence derivation guardrails are incomplete.",
      evidence:
        missingSignals.length === 0
          ? requiredSignals.join(", ")
          : `missing=[${missingSignals.join(",")}]`,
    });
  } catch (error) {
    pushCheck(checks, {
      id: "benchmark-evidence-guardrails",
      status: "fail",
      severity: "critical",
      message: "Failed to read benchmark evidence source file.",
      evidence: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const [cliPinSource, claimMatrixSource] = await Promise.all([
      readFile(cliContractPinPath, "utf8"),
      readFile(claimMatrixPath, "utf8"),
    ]);

    const cliSha = extractShaCandidates(cliPinSource)[0] ?? "";
    const claimShas = extractShaCandidates(claimMatrixSource);

    const aligned = Boolean(cliSha) && claimShas.includes(cliSha);

    pushCheck(checks, {
      id: "contract-pin-alignment",
      status: aligned ? "pass" : "fail",
      severity: "critical",
      message: aligned
        ? "Contract pin SHA is aligned between cli-contract-pin and claim matrix."
        : "Contract pin SHA mismatch between cli-contract-pin and claim matrix.",
      evidence: `cliSha='${cliSha || "missing"}', claimShas='${claimShas.join(",") || "missing"}'`,
    });
  } catch (error) {
    pushCheck(checks, {
      id: "contract-pin-alignment",
      status: "fail",
      severity: "critical",
      message: "Failed to read contract pin documents.",
      evidence: error instanceof Error ? error.message : String(error),
    });
  }

  const buildSafety = runBuildSafetyCheck(rootDir, runCommandImpl);
  pushCheck(checks, {
    id: "benchmark-build-safety",
    status: buildSafety.ok ? "pass" : "fail",
    severity: "critical",
    message: buildSafety.ok
      ? "Benchmark route build safety check passed."
      : "Benchmark route build safety check failed.",
    evidence: buildSafety.evidence,
  });

  pushCheck(checks, {
    id: "subjective-wording-review",
    status: "warn",
    severity: "low",
    message:
      "Manual review remains required for subjective wording/interpretation mismatches.",
    evidence: "Advisory-only reminder.",
  });

  notes.push(
    `Freshness thresholds: benchmark<=${freshnessBenchmarkDays.toString()} days, pricing<=${freshnessPricingDays.toString()} days.`,
  );

  return buildEvaluation({
    kind: "claims-monthly",
    periodKey,
    checks,
    notes,
  });
}

export async function runEvaluateClaimsMonthly({
  periodKey,
  freshnessBenchmarkDays,
  freshnessPricingDays,
  outputPath,
  rootDir = process.cwd(),
  token = process.env.GITHUB_TOKEN?.trim() ?? "",
  repository = process.env.GITHUB_REPOSITORY?.trim() ?? "",
  fetchImpl = fetch,
  runCommandImpl = runCommand,
}) {
  const evaluation = await evaluateClaimsMonthly({
    periodKey,
    freshnessBenchmarkDays,
    freshnessPricingDays,
    rootDir,
    token,
    repository,
    fetchImpl,
    runCommandImpl,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evaluation, null, 2)}\n`, "utf8");

  return evaluation;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  const periodKey =
    typeof args["period-key"] === "string" ? args["period-key"] : "";
  const outputPath =
    typeof args.output === "string" ? path.resolve(args.output) : "";
  const freshnessBenchmarkDays = toInteger(args["freshness-benchmark-days"], 14);
  const freshnessPricingDays = toInteger(args["freshness-pricing-days"], 45);

  if (!periodKey) {
    throw new Error("--period-key is required.");
  }

  if (!outputPath) {
    throw new Error("--output is required.");
  }

  if (freshnessBenchmarkDays < 1 || freshnessPricingDays < 1) {
    throw new Error("freshness thresholds must be positive integers.");
  }

  const evaluation = await runEvaluateClaimsMonthly({
    periodKey,
    freshnessBenchmarkDays,
    freshnessPricingDays,
    outputPath,
  });

  process.stdout.write(`${JSON.stringify(evaluation)}\n`);
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
