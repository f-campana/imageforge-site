import assert from "node:assert/strict";
import test from "node:test";

import {
  collectTopLevelMetadataEntries,
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

test("collectTopLevelMetadataEntries reads only root metadata fields", () => {
  const layoutSource = `
    export const metadata: Metadata = {
      title: "Root title",
      description: "Root description",
      openGraph: {
        title: "Nested OG title",
        description: "Nested OG description",
      },
      twitter: {
        title: "Nested Twitter title",
      },
    };
  `;

  const titles = collectTopLevelMetadataEntries(layoutSource, "title");
  const descriptions = collectTopLevelMetadataEntries(layoutSource, "description");

  assert.deepEqual(titles, ["Root title"]);
  assert.deepEqual(descriptions, ["Root description"]);
});

test("collectTopLevelMetadataEntries handles irregular indentation", () => {
  const layoutSource = `
export const metadata: Metadata = {
title: "No indent title",
description:"Tight description",
  openGraph: {
      title: "Nested title should be ignored"
  },
};
  `;

  const titles = collectTopLevelMetadataEntries(layoutSource, "title");
  const descriptions = collectTopLevelMetadataEntries(layoutSource, "description");

  assert.deepEqual(titles, ["No indent title"]);
  assert.deepEqual(descriptions, ["Tight description"]);
});
