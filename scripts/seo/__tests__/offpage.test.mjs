import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { evaluateBrandPresence, runOffpageChecks } from "../offpage.mjs";

test("evaluateBrandPresence passes when GitHub and npm links are present", () => {
  const result = evaluateBrandPresence(
    [
      "https://github.com/f-campana/imageforge",
      "https://www.npmjs.com/package/@imageforge/cli",
    ],
    [],
  );

  assert.equal(result.status, "pass");
  assert.equal(result.githubFound, true);
  assert.equal(result.npmFound, true);
});

test("evaluateBrandPresence warns when GitHub link is missing", () => {
  const result = evaluateBrandPresence(
    ["https://www.npmjs.com/package/@imageforge/cli"],
    [],
  );

  assert.equal(result.status, "warn");
  assert.equal(result.githubFound, false);
  assert.equal(result.npmFound, true);
});

test("evaluateBrandPresence warns when npm link is missing", () => {
  const result = evaluateBrandPresence(
    ["https://github.com/f-campana/imageforge"],
    [],
  );

  assert.equal(result.status, "warn");
  assert.equal(result.githubFound, true);
  assert.equal(result.npmFound, false);
});

test("runOffpageChecks skips public checks when placeholder site URL is configured", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "imageforge-offpage-"));
  const appDir = path.join(tempRoot, "app");
  const componentsDir = path.join(tempRoot, "components");

  try {
    await mkdir(appDir, { recursive: true });
    await mkdir(componentsDir, { recursive: true });
    await writeFile(
      path.join(appDir, "page.tsx"),
      '<a href="https://github.com/f-campana/imageforge">GitHub</a>',
      "utf8",
    );
    await writeFile(
      path.join(componentsDir, "cta.tsx"),
      '<a href="https://www.npmjs.com/package/@imageforge/cli">npm</a>',
      "utf8",
    );

    const result = await runOffpageChecks({
      appDir,
      componentsDir,
      competitorUrls: [],
      site: {
        url: "https://example.com",
        source: "NEXT_PUBLIC_SITE_URL",
        error: null,
        isPlaceholder: true,
      },
    });

    const reachabilityCheck = result.checks.find(
      (check) => check.id === "offpage.public_homepage_reachability",
    );
    const metadataCheck = result.checks.find(
      (check) => check.id === "offpage.public_metadata_presence",
    );

    assert.equal(reachabilityCheck?.status, "skip");
    assert.match(
      reachabilityCheck?.message ?? "",
      /placeholder site URL is configured/i,
    );
    assert.equal(metadataCheck?.status, "skip");
    assert.match(
      metadataCheck?.message ?? "",
      /placeholder site URL is configured/i,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
