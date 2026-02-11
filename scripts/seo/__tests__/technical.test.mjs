import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  evaluateMetadataFields,
  evaluateSchemaPresence,
  findBrokenInternalLinks,
} from "../technical.mjs";

const fixturesDir = path.join(import.meta.dirname, "fixtures");

test("evaluateMetadataFields detects canonical metadata", async () => {
  const source = await readFile(path.join(fixturesDir, "layout-good.tsx"), "utf8");
  const result = evaluateMetadataFields(source);

  assert.equal(result.metadataBase, true);
  assert.equal(result.canonical, true);
  assert.equal(result.openGraphImage, true);
  assert.equal(result.twitterImage, true);
});

test("evaluateMetadataFields flags missing canonical", async () => {
  const source = await readFile(
    path.join(fixturesDir, "layout-missing-canonical.tsx"),
    "utf8",
  );
  const result = evaluateMetadataFields(source);

  assert.equal(result.metadataBase, true);
  assert.equal(result.canonical, false);
});

test("evaluateSchemaPresence requires both schema types", () => {
  const result = evaluateSchemaPresence(
    '<script type="application/ld+json"></script>',
    '"@type": "SoftwareApplication"\n"@type": "WebSite"',
  );

  assert.equal(result.jsonLdScript, true);
  assert.equal(result.softwareApplicationSchema, true);
  assert.equal(result.websiteSchema, true);
});

test("findBrokenInternalLinks returns unknown routes", () => {
  const broken = findBrokenInternalLinks(["/", "/docs", "/pricing"], ["/", "/docs"]);

  assert.deepEqual(broken, ["/pricing"]);
});
