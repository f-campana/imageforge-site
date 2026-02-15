#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

function readJsonOr(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function resolveFile(inputPath) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

function assertValidSnapshot(snapshot) {
  if (!isRecord(snapshot)) {
    throw new Error("Snapshot must be an object.");
  }

  if (snapshot.schemaVersion !== "1.0") {
    throw new Error('Snapshot schemaVersion must be "1.0".');
  }

  const requiredRoot = [
    "snapshotId",
    "generatedAt",
    "asOfDate",
    "owner",
    "source",
    "summary",
  ];
  for (const key of requiredRoot) {
    if (snapshot[key] === undefined || snapshot[key] === null) {
      throw new Error(`Snapshot missing required key '${key}'.`);
    }
  }

  if (!isNonEmptyString(snapshot.snapshotId)) {
    throw new Error("Snapshot snapshotId must be a non-empty string.");
  }

  if (!isRecord(snapshot.source)) {
    throw new Error("Snapshot source must be an object.");
  }

  if (!isRecord(snapshot.summary)) {
    throw new Error("Snapshot summary must be an object.");
  }
}

function snapshotSortValue(entry) {
  const runId = Number(entry?.source?.runId ?? 0);
  const runAttempt = Number(entry?.source?.runAttempt ?? 0);
  if (Number.isFinite(runId)) {
    return runId * 100 + (Number.isFinite(runAttempt) ? runAttempt : 0);
  }

  const timestamp = Date.parse(String(entry?.generatedAt ?? ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`Usage: node scripts/benchmark/upsert-snapshot.mjs \\
  --snapshot <path> \\
  [--latest <path>] \\
  [--history <path>] \\
  [--retention <n>]`);
    return;
  }

  const snapshotPath =
    typeof args.snapshot === "string" ? resolveFile(args.snapshot) : "";
  if (!snapshotPath) {
    throw new Error("--snapshot is required.");
  }

  const latestPath =
    typeof args.latest === "string"
      ? resolveFile(args.latest)
      : resolveFile("data/benchmarks/latest.json");
  const historyPath =
    typeof args.history === "string"
      ? resolveFile(args.history)
      : resolveFile("data/benchmarks/history.json");

  const retention =
    typeof args.retention === "string"
      ? Number.parseInt(args.retention, 10)
      : 20;
  if (!Number.isInteger(retention) || retention < 1) {
    throw new Error("--retention must be an integer >= 1.");
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  assertValidSnapshot(snapshot);

  const existingHistory = readJsonOr(historyPath, {
    schemaVersion: "1.0",
    generatedAt: new Date(0).toISOString(),
    retention,
    items: [],
  });

  const existingItems = Array.isArray(existingHistory.items)
    ? existingHistory.items.filter((entry) => isRecord(entry))
    : [];

  const deduped = [
    snapshot,
    ...existingItems.filter(
      (entry) => entry.snapshotId !== snapshot.snapshotId,
    ),
  ];
  deduped.sort(
    (left, right) => snapshotSortValue(right) - snapshotSortValue(left),
  );

  const trimmed = deduped.slice(0, retention);

  const history = {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    retention,
    items: trimmed,
  };

  writeJson(latestPath, snapshot);
  writeJson(historyPath, history);

  console.log(`LATEST_JSON=${latestPath}`);
  console.log(`HISTORY_JSON=${historyPath}`);
  console.log(`HISTORY_COUNT=${trimmed.length.toString()}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
