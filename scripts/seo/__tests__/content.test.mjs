import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateKeywordCoverage,
  evaluateTitleDescription,
} from "../content.mjs";

test("evaluateKeywordCoverage reports missing clusters", () => {
  const result = evaluateKeywordCoverage("image optimization webp avif", [
    "image optimization",
    "webp conversion",
    "hash-based image caching",
  ]);

  assert.equal(result.covered.length, 1);
  assert.equal(result.missing.length, 2);
  assert.equal(result.coverageRatio, 1 / 3);
});

test("evaluateTitleDescription catches invalid lengths", () => {
  const issues = evaluateTitleDescription("Short", "Too short");
  assert.ok(issues.length >= 2);
});
