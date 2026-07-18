import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectCrawlableContentFiles,
  collectTopLevelMetadataEntries,
  evaluateKeywordCoverage,
  evaluateTitleDescription,
} from "../content.mjs";

test("collectCrawlableContentFiles includes rendered docs content sources", async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), "imageforge-seo-content-"));
  const appDir = path.join(rootDir, "app");
  const componentsDir = path.join(rootDir, "components");
  const docsDir = path.join(rootDir, "lib", "docs");
  try {
    await Promise.all([
      mkdir(appDir, { recursive: true }),
      mkdir(path.join(componentsDir, "landing"), { recursive: true }),
      mkdir(docsDir, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        path.join(appDir, "page.tsx"),
        "export default function Page() {}",
      ),
      writeFile(
        path.join(componentsDir, "landing", "Hero.tsx"),
        "export function Hero() {}",
      ),
      writeFile(path.join(docsDir, "content.ts"), "export const docs = [];"),
      writeFile(path.join(docsDir, "ignored.json"), "{}"),
    ]);

    const files = await collectCrawlableContentFiles({
      rootDir,
      appDir,
      componentsDir,
    });
    assert.deepEqual(files.map((file) => path.relative(rootDir, file)).sort(), [
      "app/page.tsx",
      "components/landing/Hero.tsx",
      "lib/docs/content.ts",
    ]);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("CI landing copy derives published-version caveats from the release contract", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components", "landing", "CICheckExample.tsx"),
    "utf8",
  );
  assert.match(source, /PUBLISHED_RELEASE_COPY\.ciCheckCaveat/u);
  assert.doesNotMatch(source, /\bv?\d+\.\d+\.\d+\b/u);
});

test("Next.js landing example types dynamic manifest keys and handles misses", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components", "landing", "constants.ts"),
    "utf8",
  );
  assert.match(source, /Record<string, ImageForgeEntry>/u);
  assert.match(source, /if \(!image\) throw new Error/u);
});

test("landing comparison links to the full sourced docs matrix", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components", "landing", "ComparisonAndCost.tsx"),
    "utf8",
  );
  assert.match(source, /\/docs\/image-service-comparison/u);
  assert.doesNotMatch(source, /COMPARISON_ROWS/u);
});

test("framework compatibility wording stays evidence-bounded", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components", "landing", "NextIntegration.tsx"),
    "utf8",
  );
  assert.match(source, /framework-neutral JSON/u);
  assert.match(source, /\/docs\/static-html/u);
  assert.doesNotMatch(source, /works in Astro, Nuxt, Remix/u);
});

test("production docs derive the published CLI version from release metadata", async () => {
  const source = await readFile(
    path.join(process.cwd(), "lib", "docs", "content.ts"),
    "utf8",
  );
  assert.match(source, /IMAGEFORGE_CLI_VERSION/u);
  assert.doesNotMatch(source, /\bv?\d+\.\d+\.\d+\b/u);
});

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
  const descriptions = collectTopLevelMetadataEntries(
    layoutSource,
    "description",
  );

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
  const descriptions = collectTopLevelMetadataEntries(
    layoutSource,
    "description",
  );

  assert.deepEqual(titles, ["No indent title"]);
  assert.deepEqual(descriptions, ["Tight description"]);
});
