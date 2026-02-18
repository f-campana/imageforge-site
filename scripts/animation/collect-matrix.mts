import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

type MotionMode = "default" | "reduced";

type MatrixRow = {
  route: string;
  viewport: string;
  width: number;
  height: number;
  motionMode: MotionMode;
  hasRootOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  prefersReducedMotionMatch: boolean;
  motionWrapCount: number;
  heroClaimPresent: boolean | null;
  primaryCtaPresent: boolean | null;
  primaryCtaHref: string | null;
  benchmarkHeadingPresent: boolean | null;
};

type MatrixOutput = {
  generatedAt: string;
  baseUrl: string;
  routes: string[];
  rows: MatrixRow[];
};

const ROUTES = ["/", "/benchmarks/latest"];

const VIEWPORTS = [
  { label: "320x800", width: 320, height: 800 },
  { label: "360x800", width: 360, height: 800 },
  { label: "375x812", width: 375, height: 812 },
  { label: "390x844", width: 390, height: 844 },
  { label: "412x915", width: 412, height: 915 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "1024x1366", width: 1024, height: 1366 },
  { label: "1280x800", width: 1280, height: 800 },
  { label: "1440x900", width: 1440, height: 900 },
  { label: "568x320", width: 568, height: 320 },
  { label: "667x375", width: 667, height: 375 },
  { label: "812x375", width: 812, height: 375 },
] as const;

const MODES: Array<{
  motionMode: MotionMode;
  reducedMotion: "reduce" | "no-preference";
}> = [
  { motionMode: "default", reducedMotion: "no-preference" },
  { motionMode: "reduced", reducedMotion: "reduce" },
];

function readArg(flag: string): string | undefined {
  const index = process.argv.findIndex((entry) => entry === flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function ensureOutputDir(filePath: string): void {
  const outputDir = path.dirname(filePath);
  fs.mkdirSync(outputDir, { recursive: true });
}

async function main(): Promise<void> {
  const baseUrl =
    readArg("--base-url") ?? process.env.BASE_URL ?? "http://127.0.0.1:3205";
  const outputPath =
    readArg("--output") ??
    process.env.OUTPUT_FILE ??
    path.resolve(process.cwd(), ".tmp/animation/matrix.json");

  const browser = await chromium.launch({ headless: true });
  const rows: MatrixRow[] = [];

  try {
    for (const mode of MODES) {
      for (const viewport of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          reducedMotion: mode.reducedMotion,
        });

        try {
          for (const route of ROUTES) {
            const page = await context.newPage();

            try {
              await page.goto(`${baseUrl}${route}`, {
                waitUntil: "networkidle",
              });
              await page.waitForTimeout(120);

              const metrics = await page.evaluate(() => {
                const doc = document.documentElement;
                const hasRootOverflow = doc.scrollWidth > window.innerWidth;
                const prefersReducedMotionMatch = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;

                const heroHeading =
                  document.querySelector("h1")?.textContent ?? "";
                const heroClaimPresent =
                  /optimize once,\s*deploy everywhere/i.test(heroHeading);

                const ctaAnchors = Array.from(
                  document.querySelectorAll("a[href]"),
                );
                const primaryCta = ctaAnchors.find((node) =>
                  (node.textContent ?? "")
                    .toLowerCase()
                    .includes("get started"),
                );
                const primaryCtaHref = primaryCta?.getAttribute("href") ?? null;

                const benchmarkHeadingPresent = Array.from(
                  document.querySelectorAll("h1"),
                ).some((node) =>
                  /latest approved benchmark snapshot|no approved benchmark snapshot yet/i.test(
                    node.textContent ?? "",
                  ),
                );

                return {
                  hasRootOverflow,
                  scrollWidth: doc.scrollWidth,
                  innerWidth: window.innerWidth,
                  prefersReducedMotionMatch,
                  motionWrapCount:
                    document.querySelectorAll("[data-motion-wrap]").length,
                  heroClaimPresent,
                  primaryCtaPresent: primaryCta !== undefined,
                  primaryCtaHref,
                  benchmarkHeadingPresent,
                };
              });

              rows.push({
                route,
                viewport: viewport.label,
                width: viewport.width,
                height: viewport.height,
                motionMode: mode.motionMode,
                hasRootOverflow: metrics.hasRootOverflow,
                scrollWidth: metrics.scrollWidth,
                innerWidth: metrics.innerWidth,
                prefersReducedMotionMatch: metrics.prefersReducedMotionMatch,
                motionWrapCount: metrics.motionWrapCount,
                heroClaimPresent:
                  route === "/" ? metrics.heroClaimPresent : null,
                primaryCtaPresent:
                  route === "/" ? metrics.primaryCtaPresent : null,
                primaryCtaHref: route === "/" ? metrics.primaryCtaHref : null,
                benchmarkHeadingPresent:
                  route === "/benchmarks/latest"
                    ? metrics.benchmarkHeadingPresent
                    : null,
              });
            } finally {
              await page.close();
            }
          }
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const output: MatrixOutput = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routes: ROUTES,
    rows,
  };

  ensureOutputDir(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  process.stdout.write(
    `animation matrix collected: ${rows.length.toString()} rows -> ${outputPath}\n`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`animation matrix collection failed: ${message}\n`);
  process.exitCode = 1;
});
