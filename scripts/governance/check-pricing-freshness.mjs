#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_AGE_DAYS = 45;
const DEFAULT_CONSTANTS_RELATIVE_PATH = "components/landing/constants.ts";
const DEFAULT_OUTPUT_RELATIVE_PATH = ".tmp/governance/pricing-freshness.json";

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
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export function parsePricingAsOf(constantsSource) {
  const match = String(constantsSource).match(
    /export const PRICING_AS_OF\s*=\s*"([^"]+)";/u,
  );
  return match?.[1] ?? "";
}

function ageInDays(thenDate, nowDate) {
  const ageMs = nowDate.getTime() - thenDate.getTime();
  return Math.max(0, Math.floor(ageMs / DAY_MS));
}

export function evaluatePricingFreshness({
  pricingAsOf,
  maxAgeDays,
  now = new Date(),
}) {
  if (!pricingAsOf) {
    return {
      ok: false,
      reason: "missing_pricing_as_of",
      parsedDate: null,
      ageDays: null,
      message: "PRICING_AS_OF is missing.",
    };
  }

  const parsedDate = new Date(pricingAsOf);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      ok: false,
      reason: "invalid_pricing_as_of",
      parsedDate: null,
      ageDays: null,
      message: `PRICING_AS_OF is invalid: '${pricingAsOf}'.`,
    };
  }

  const ageDays = ageInDays(parsedDate, now);
  if (ageDays > maxAgeDays) {
    return {
      ok: false,
      reason: "stale_pricing_as_of",
      parsedDate: parsedDate.toISOString(),
      ageDays,
      message: `PRICING_AS_OF is stale (${ageDays.toString()} days old; threshold ${maxAgeDays.toString()} days).`,
    };
  }

  return {
    ok: true,
    reason: "fresh",
    parsedDate: parsedDate.toISOString(),
    ageDays,
    message: `PRICING_AS_OF is fresh (${ageDays.toString()} days old; threshold ${maxAgeDays.toString()} days).`,
  };
}

export async function runCheckPricingFreshness({
  rootDir = process.cwd(),
  constantsPath = path.join(rootDir, DEFAULT_CONSTANTS_RELATIVE_PATH),
  outputPath = path.join(rootDir, DEFAULT_OUTPUT_RELATIVE_PATH),
  maxAgeDays = DEFAULT_MAX_AGE_DAYS,
  now = new Date(),
} = {}) {
  const constantsAbsolutePath = path.resolve(constantsPath);
  const outputAbsolutePath = path.resolve(outputPath);

  let constantsSource = "";
  try {
    constantsSource = await readFile(constantsAbsolutePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const report = {
      version: "1.0.0",
      generatedAt: now.toISOString(),
      status: "fail",
      reason: "constants_read_failed",
      message: `Unable to read pricing constants file: ${message}`,
      maxAgeDays,
      pricingAsOf: "",
      parsedDate: null,
      ageDays: null,
      constantsPath: constantsAbsolutePath,
    };

    await mkdir(path.dirname(outputAbsolutePath), { recursive: true });
    await writeFile(outputAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
    return report;
  }

  const pricingAsOf = parsePricingAsOf(constantsSource);
  const evaluation = evaluatePricingFreshness({
    pricingAsOf,
    maxAgeDays,
    now,
  });

  const report = {
    version: "1.0.0",
    generatedAt: now.toISOString(),
    status: evaluation.ok ? "pass" : "fail",
    reason: evaluation.reason,
    message: evaluation.message,
    maxAgeDays,
    pricingAsOf,
    parsedDate: evaluation.parsedDate,
    ageDays: evaluation.ageDays,
    constantsPath: constantsAbsolutePath,
  };

  await mkdir(path.dirname(outputAbsolutePath), { recursive: true });
  await writeFile(outputAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const now = args.now ? new Date(String(args.now)) : new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error("--now must be a valid date string.");
  }

  const maxAgeDays = toInteger(args["max-age-days"], DEFAULT_MAX_AGE_DAYS);
  if (maxAgeDays < 1) {
    throw new Error("--max-age-days must be a positive integer.");
  }

  const report = await runCheckPricingFreshness({
    constantsPath:
      typeof args.constants === "string"
        ? path.resolve(args.constants)
        : undefined,
    outputPath:
      typeof args.output === "string" ? path.resolve(args.output) : undefined,
    maxAgeDays,
    now,
  });

  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== "pass") {
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
