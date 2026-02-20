import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  evaluateMetadataFields,
  evaluateRouteH1Coverage,
  evaluateSchemaPresence,
  findBrokenInternalLinks,
} from "../technical.mjs";

const fixturesDir = path.join(import.meta.dirname, "fixtures");

test("evaluateMetadataFields detects canonical metadata", async () => {
  const source = await readFile(
    path.join(fixturesDir, "layout-good.tsx"),
    "utf8",
  );
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

test("evaluateSchemaPresence validates homepage JSON-LD wiring and schema builders", () => {
  const pageSource = `
    const homepageSchemas = buildHomepageSchemas(resolveSiteUrl());
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
  `;
  const schemaSource = `
    export function buildWebsiteSchema() {
      return { "@type": "WebSite" };
    }
    export function buildSoftwareApplicationSchema() {
      return { "@type": "SoftwareApplication" };
    }
    export function buildHomepageSchemas() {
      return [buildWebsiteSchema(), buildSoftwareApplicationSchema()];
    }
  `;
  const result = evaluateSchemaPresence(pageSource, schemaSource);

  assert.equal(result.jsonLdScript, true);
  assert.equal(result.pageUsesHomepageSchemaBuilder, true);
  assert.equal(result.pageUsesJsonLdSerializer, true);
  assert.equal(result.websiteSchemaBuilder, true);
  assert.equal(result.softwareApplicationSchemaBuilder, true);
  assert.equal(result.homepageSchemaIncludesWebsite, true);
  assert.equal(result.homepageSchemaIncludesSoftwareApplication, true);
});

test("evaluateSchemaPresence fails when homepage builder wiring is missing", () => {
  const pageSource = '<script type="application/ld+json"></script>';
  const schemaSource = `
    export function buildWebsiteSchema() {
      return { "@type": "WebSite" };
    }
    export function buildSoftwareApplicationSchema() {
      return { "@type": "SoftwareApplication" };
    }
    export function buildHomepageSchemas() {
      return [buildWebsiteSchema(), buildSoftwareApplicationSchema()];
    }
  `;
  const result = evaluateSchemaPresence(pageSource, schemaSource);

  assert.equal(result.jsonLdScript, true);
  assert.equal(result.pageUsesHomepageSchemaBuilder, false);
  assert.equal(result.pageUsesJsonLdSerializer, false);
});

test("findBrokenInternalLinks returns unknown routes", () => {
  const broken = findBrokenInternalLinks(
    ["/", "/docs", "/pricing"],
    ["/", "/docs"],
  );

  assert.deepEqual(broken, ["/pricing"]);
});

test("findBrokenInternalLinks accepts dynamic single-segment routes", () => {
  const broken = findBrokenInternalLinks(
    ["/blog/my-post"],
    ["/", "/blog/[slug]"],
  );

  assert.deepEqual(broken, []);
});

test("findBrokenInternalLinks accepts catch-all routes", () => {
  const broken = findBrokenInternalLinks(
    ["/docs/getting-started/install"],
    ["/", "/docs/[...slug]"],
  );

  assert.deepEqual(broken, []);
});

test("findBrokenInternalLinks accepts optional catch-all routes", () => {
  const broken = findBrokenInternalLinks(["/docs"], ["/", "/docs/[[...slug]]"]);

  assert.deepEqual(broken, []);
});

test("evaluateRouteH1Coverage passes when each route has one H1", () => {
  const result = evaluateRouteH1Coverage([
    {
      route: "/",
      h1Count: 1,
      sourceFile: "app/page.tsx",
      auditedFileCount: 5,
    },
    {
      route: "/benchmarks/latest",
      h1Count: 1,
      sourceFile: "app/benchmarks/latest/page.tsx",
      auditedFileCount: 4,
    },
  ]);

  assert.equal(result.status, "pass");
  assert.match(result.message, /exactly one H1/i);
  assert.match(result.evidence, /\/=1h1/);
  assert.match(result.evidence, /\/benchmarks\/latest=1h1/);
});

test("evaluateRouteH1Coverage warns when a route has zero or multiple H1 entries", () => {
  const result = evaluateRouteH1Coverage([
    {
      route: "/",
      h1Count: 2,
      sourceFile: "app/page.tsx",
      auditedFileCount: 6,
    },
    {
      route: "/benchmarks/latest",
      h1Count: 0,
      sourceFile: "app/benchmarks/latest/page.tsx",
      auditedFileCount: 3,
    },
  ]);

  assert.equal(result.status, "warn");
  assert.match(result.message, /do not resolve to exactly one H1/i);
  assert.match(result.evidence, /\/=2h1/);
  assert.match(result.evidence, /\/benchmarks\/latest=0h1/);
});
