import { describe, expect, it } from "vitest";

import { DOC_CATALOG, DOC_SLUGS } from "@/lib/docs/catalog";
import { DOCS, getDoc } from "@/lib/docs/content";
import { PUBLISHED_RELEASE_COPY } from "@/lib/docs/release-copy";
import {
  IMAGEFORGE_CLI_PACKAGE_SPEC,
  IMAGEFORGE_CLI_VERSION,
} from "@/lib/release";

describe("documentation content contract", () => {
  it("publishes a unique, substantive set of high-intent guides", () => {
    expect(DOCS).toHaveLength(13);
    expect(new Set(DOC_SLUGS).size).toBe(DOCS.length);
    expect(DOCS.map(({ slug, label }) => ({ slug, label }))).toEqual(
      DOC_CATALOG,
    );

    for (const doc of DOCS) {
      expect(doc.title.length).toBeGreaterThan(20);
      expect(doc.description.length).toBeGreaterThan(60);
      expect(doc.sections.length).toBeGreaterThanOrEqual(2);
      expect(getDoc(doc.slug)).toBe(doc);
      for (const section of doc.sections) {
        for (const link of section.links ?? []) {
          expect(new URL(link.url).protocol).toBe("https:");
        }
      }
    }
  });

  it("keeps first-run and Next.js guidance aligned with CLI behavior", () => {
    const gettingStarted = getDoc("getting-started");
    const nextjs = getDoc("nextjs");
    const gettingStartedText = JSON.stringify(gettingStarted);
    const nextjsText = JSON.stringify(nextjs);

    expect(gettingStartedText).toContain("--dry-run");
    expect(gettingStartedText).toContain("--check");
    expect(gettingStartedText).toContain(".imageforge-cache.json");
    expect(gettingStartedText).toContain("Confirm first success");
    expect(nextjsText).toContain("hero.outputs.webp.path");
    expect(nextjsText).toContain("unoptimized");
    expect(nextjsText).toContain("Verify the integration");
    expect(nextjsText).toContain("/_next/image");
  });

  it("publishes a framework-free path and a sourced comparison route", () => {
    const staticHtmlText = JSON.stringify(getDoc("static-html"));
    const comparisonText = JSON.stringify(getDoc("image-service-comparison"));

    expect(staticHtmlText).toContain("<picture>");
    expect(staticHtmlText).toContain("srcset");
    expect(staticHtmlText).toContain("--check");
    expect(comparisonText).toContain("managed image services");
    expect(comparisonText).toContain("units are not equivalent");
  });

  it("keeps executable configuration and freshness examples internally consistent", () => {
    const configuration = getDoc("configuration");
    const configExample = configuration?.sections.find(
      ({ heading }) => heading === "Example config",
    )?.code;
    expect(configExample).toBeDefined();
    expect(JSON.parse(configExample ?? "")).toEqual({
      output: "imageforge.json",
      formats: ["webp", "avif"],
      quality: 80,
      blur: true,
      widths: [320, 640, 960, 1280],
      outDir: "public/generated",
      concurrency: 4,
    });

    const gettingStarted = getDoc("getting-started");
    const generate = gettingStarted?.sections.find(
      ({ heading }) => heading === "2. Generate derivatives",
    )?.code;
    const check = gettingStarted?.sections.find(
      ({ heading }) => heading === "3. Verify generated state",
    )?.code;
    expect(generate).toBeDefined();
    expect(check).toBe(`${generate} --check`);
  });

  it("renders the checked-in published behavior contract", () => {
    const docsText = JSON.stringify(DOCS);

    expect(docsText).toContain(`Published version ${IMAGEFORGE_CLI_VERSION}`);
    expect(docsText).toContain(PUBLISHED_RELEASE_COPY.manifestContract);
    expect(docsText).toContain(PUBLISHED_RELEASE_COPY.deletedSourceContract);
    expect(docsText).not.toContain("does not validate imageforge.json");
    expect(docsText).not.toContain("does not rewrite an empty manifest/cache");
  });

  it("pins every package-manager command to the checked-in release", () => {
    const packageCommands = DOCS.flatMap(({ sections }) =>
      sections.flatMap(({ code }) =>
        code?.includes("@imageforge/cli") ? [code] : [],
      ),
    );

    expect(packageCommands.length).toBeGreaterThan(0);
    for (const command of packageCommands) {
      expect(command).toContain(IMAGEFORGE_CLI_PACKAGE_SPEC);
      expect(command).not.toMatch(/@imageforge\/cli(?=\s|$)/u);
    }
  });

  it("states the published reference and schema boundaries", () => {
    const cliReferenceText = JSON.stringify(getDoc("cli-reference"));
    const manifestText = JSON.stringify(getDoc("manifest"));
    const troubleshootingText = JSON.stringify(getDoc("troubleshooting"));

    expect(cliReferenceText).toContain("Published defaults");
    expect(cliReferenceText).toContain("--check / --no-check");
    expect(cliReferenceText).toContain("-V, --version");
    expect(cliReferenceText).toContain(
      "Check and dry-run modes cannot be combined",
    );
    const manifestExample = getDoc("manifest")?.sections.find(
      ({ heading }) => heading === "Representative manifest",
    )?.code;
    expect(JSON.parse(manifestExample ?? "{}").version).toBe("1.0");
    expect(manifestText).toContain("does not publish standalone JSON Schema");
    expect(troubleshootingText).toContain(
      "Sharp installation and platform support",
    );
    expect(troubleshootingText).toContain("WebP and AVIF are output formats");
  });

  it("makes the CI guide runnable from a clean pull-request runner", () => {
    const ci = getDoc("ci");
    const ciText = JSON.stringify(ci);

    expect(ciText).toContain(".github/workflows/images.yml");
    expect(ciText).toContain("actions/checkout@v4");
    expect(ciText).toContain("pnpm install --frozen-lockfile");
    expect(ciText).toContain("pnpm run images:check");
    expect(ciText).toContain(".imageforge-cache.json");
    expect(ciText).toContain("imageforge.json");
    expect(ciText).toContain("full commit SHAs");
  });
});
