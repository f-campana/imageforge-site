#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { isBehaviorContract } from "./release-contract.mjs";

const PACKAGE_NAME = "@imageforge/cli";
const REGISTRY_URL = "https://registry.npmjs.org/@imageforge%2Fcli";
const DEFAULT_RELEASE_PATH = "data/release.json";
const DEFAULT_OUTPUT_PATH = ".tmp/governance/release-freshness.json";
const DEFAULT_RETRY_DELAYS_MS = [250, 1_000];
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function isRetriableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

export class RegistryFetchError extends Error {
  constructor(message, attempts) {
    super(message);
    this.name = "RegistryFetchError";
    this.attempts = attempts;
  }
}

function hasEvidenceContract(release) {
  const evidence = release?.evidence;
  return (
    evidence &&
    typeof evidence.packageIntegrity === "string" &&
    evidence.packageIntegrity.startsWith("sha512-") &&
    typeof evidence.sourceGitHead === "string" &&
    /^[a-f0-9]{40}$/u.test(evidence.sourceGitHead) &&
    evidence.verificationCommand ===
      "node scripts/governance/verify-release-behavior.mjs"
  );
}

export function evaluateReleaseFreshness({ release, packument }) {
  const registryVersion = packument?.["dist-tags"]?.latest;
  const publishedAt =
    typeof registryVersion === "string"
      ? packument?.time?.[registryVersion]
      : undefined;

  if (
    !release ||
    release.package !== PACKAGE_NAME ||
    typeof release.version !== "string" ||
    typeof release.publishedAt !== "string" ||
    !isBehaviorContract(release.behavior) ||
    !hasEvidenceContract(release)
  ) {
    return {
      ok: false,
      reason: "invalid_release_metadata",
      message: `Release metadata must identify ${PACKAGE_NAME} with version, publishedAt, package evidence, and boolean behavior capabilities.`,
      registryVersion:
        typeof registryVersion === "string" ? registryVersion : null,
      registryPublishedAt: typeof publishedAt === "string" ? publishedAt : null,
    };
  }

  if (typeof registryVersion !== "string" || typeof publishedAt !== "string") {
    return {
      ok: false,
      reason: "invalid_registry_response",
      message:
        "The npm registry response did not include a latest version and publish time.",
      registryVersion: null,
      registryPublishedAt: null,
    };
  }

  const localPublishedAt = new Date(release.publishedAt);
  if (Number.isNaN(localPublishedAt.getTime())) {
    return {
      ok: false,
      reason: "invalid_release_metadata",
      message: "Release metadata publishedAt must be a valid date.",
      registryVersion,
      registryPublishedAt: publishedAt,
    };
  }

  const registryPublishedAt = new Date(publishedAt);
  if (Number.isNaN(registryPublishedAt.getTime())) {
    return {
      ok: false,
      reason: "invalid_registry_response",
      message: "The npm registry latest publish time is not a valid date.",
      registryVersion,
      registryPublishedAt: publishedAt,
    };
  }

  const registryRelease = packument?.versions?.[registryVersion];
  const registryIntegrity = registryRelease?.dist?.integrity;
  const registryGitHead = registryRelease?.gitHead;
  if (
    typeof registryIntegrity !== "string" ||
    typeof registryGitHead !== "string"
  ) {
    return {
      ok: false,
      reason: "invalid_registry_response",
      message:
        "The npm registry latest release lacks package integrity or source gitHead evidence.",
      registryVersion,
      registryPublishedAt: publishedAt,
    };
  }

  const versionMatches = release.version === registryVersion;
  const publishedAtMatches =
    localPublishedAt.toISOString() === registryPublishedAt.toISOString();
  const packageEvidenceMatches =
    release.evidence.packageIntegrity === registryIntegrity &&
    release.evidence.sourceGitHead === registryGitHead;
  const ok = versionMatches && publishedAtMatches && packageEvidenceMatches;

  return {
    ok,
    reason: ok ? "current" : "release_metadata_mismatch",
    message: ok
      ? `Release metadata matches npm ${PACKAGE_NAME}@${registryVersion}.`
      : `Release metadata or package evidence does not match npm ${PACKAGE_NAME}@${registryVersion}.`,
    registryVersion,
    registryPublishedAt: publishedAt,
    registryIntegrity,
    registryGitHead,
  };
}

export async function fetchPackumentWithRetry({
  fetchImpl,
  sleepImpl = sleep,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  const attempts = [];

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    try {
      const response = await fetchImpl(REGISTRY_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (!response.ok) {
        const status = Number(response.status);
        const retriable = isRetriableStatus(status);
        attempts.push({
          attempt: attempt + 1,
          status,
          retriable,
          error: `npm registry returned ${status.toString()}`,
        });
        if (!retriable) break;
      } else {
        try {
          return {
            packument: await response.json(),
            attempts: attempt + 1,
          };
        } catch (error) {
          attempts.push({
            attempt: attempt + 1,
            status: Number(response.status),
            retriable: true,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      attempts.push({
        attempt: attempt + 1,
        status: null,
        retriable: true,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const latest = attempts.at(-1);
    if (attempt < retryDelaysMs.length && latest?.retriable === true) {
      await sleepImpl(retryDelaysMs[attempt]);
    } else {
      break;
    }
  }

  const latest = attempts.at(-1);
  throw new RegistryFetchError(
    `npm registry check failed after ${attempts.length} attempts: ${latest?.error ?? "unknown error"}`,
    attempts,
  );
}

export async function runCheckReleaseFreshness({
  rootDir = process.cwd(),
  releasePath = path.join(rootDir, DEFAULT_RELEASE_PATH),
  outputPath = path.join(rootDir, DEFAULT_OUTPUT_PATH),
  fetchImpl = globalThis.fetch,
  sleepImpl = sleep,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  now = new Date(),
} = {}) {
  const outputAbsolutePath = path.resolve(outputPath);
  let report;

  try {
    const release = JSON.parse(
      await readFile(path.resolve(releasePath), "utf8"),
    );
    const { packument, attempts } = await fetchPackumentWithRetry({
      fetchImpl,
      sleepImpl,
      retryDelaysMs,
      requestTimeoutMs,
    });

    const evaluation = evaluateReleaseFreshness({
      release,
      packument,
    });
    report = {
      version: "1.0.0",
      generatedAt: now.toISOString(),
      status: evaluation.ok ? "pass" : "fail",
      package: PACKAGE_NAME,
      localVersion: release.version ?? null,
      localPublishedAt: release.publishedAt ?? null,
      registryAttempts: attempts,
      ...evaluation,
    };
  } catch (error) {
    const registryAttempts =
      error instanceof RegistryFetchError ? error.attempts : [];
    report = {
      version: "1.0.0",
      generatedAt: now.toISOString(),
      status: "fail",
      package: PACKAGE_NAME,
      reason: "release_check_failed",
      message: error instanceof Error ? error.message : String(error),
      registryAttempts: registryAttempts.length,
      registryAttemptHistory: registryAttempts,
    };
  }

  await mkdir(path.dirname(outputAbsolutePath), { recursive: true });
  await writeFile(outputAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

export async function main() {
  const report = await runCheckReleaseFreshness();
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== "pass") process.exitCode = 1;
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
