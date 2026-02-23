import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  evaluatePricingFreshness,
  parsePricingAsOf,
  runCheckPricingFreshness,
} from "../check-pricing-freshness.mjs";

test("parsePricingAsOf extracts PRICING_AS_OF constant", () => {
  const source = 'export const PRICING_AS_OF = "February 20, 2026";';
  const parsed = parsePricingAsOf(source);
  assert.equal(parsed, "February 20, 2026");
});

test("runCheckPricingFreshness passes when pricing date is within threshold", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-pricing-fresh-"));
  const constantsPath = path.join(tempDir, "constants.ts");
  const outputPath = path.join(tempDir, "pricing-freshness.json");

  writeFileSync(
    constantsPath,
    'export const PRICING_AS_OF = "February 20, 2026";\n',
    "utf8",
  );

  const report = await runCheckPricingFreshness({
    constantsPath,
    outputPath,
    maxAgeDays: 45,
    now: new Date("2026-02-23T00:00:00.000Z"),
  });

  assert.equal(report.status, "pass");
  assert.equal(report.reason, "fresh");
  assert.equal(report.ageDays, 3);

  const persisted = JSON.parse(await readFile(outputPath, "utf8"));
  assert.equal(persisted.status, "pass");
});

test("runCheckPricingFreshness fails when pricing date is stale", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-pricing-stale-"));
  const constantsPath = path.join(tempDir, "constants.ts");
  const outputPath = path.join(tempDir, "pricing-freshness.json");

  writeFileSync(
    constantsPath,
    'export const PRICING_AS_OF = "January 1, 2026";\n',
    "utf8",
  );

  const report = await runCheckPricingFreshness({
    constantsPath,
    outputPath,
    maxAgeDays: 45,
    now: new Date("2026-02-23T00:00:00.000Z"),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.reason, "stale_pricing_as_of");
  assert.equal(report.ageDays, 53);
});

test("runCheckPricingFreshness fails when PRICING_AS_OF is invalid", async () => {
  const tempDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-pricing-invalid-"),
  );
  const constantsPath = path.join(tempDir, "constants.ts");

  writeFileSync(
    constantsPath,
    'export const PRICING_AS_OF = "not-a-date";\n',
    "utf8",
  );

  const report = await runCheckPricingFreshness({
    constantsPath,
    outputPath: path.join(tempDir, "pricing-freshness.json"),
    maxAgeDays: 45,
    now: new Date("2026-02-23T00:00:00.000Z"),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.reason, "invalid_pricing_as_of");
});

test("runCheckPricingFreshness fails when PRICING_AS_OF is missing", async () => {
  const tempDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-pricing-missing-"),
  );
  const constantsPath = path.join(tempDir, "constants.ts");

  writeFileSync(
    constantsPath,
    'export const PRICING_OWNER = "Team";\n',
    "utf8",
  );

  const report = await runCheckPricingFreshness({
    constantsPath,
    outputPath: path.join(tempDir, "pricing-freshness.json"),
    maxAgeDays: 45,
    now: new Date("2026-02-23T00:00:00.000Z"),
  });

  assert.equal(report.status, "fail");
  assert.equal(report.reason, "missing_pricing_as_of");
});

test("evaluatePricingFreshness returns missing reason for blank values", () => {
  const result = evaluatePricingFreshness({
    pricingAsOf: "",
    maxAgeDays: 45,
    now: new Date("2026-02-23T00:00:00.000Z"),
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "missing_pricing_as_of");
});
