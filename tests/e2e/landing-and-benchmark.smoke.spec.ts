import { expect, test } from "@playwright/test";

import { IMAGEFORGE_CLI_PACKAGE_SPEC } from "@/lib/release";

test("landing page renders hero, CTA, and package-manager tabs", async ({
  page,
}) => {
  await page.goto("/");

  const heroSection = page.locator("section#top");

  await expect(
    heroSection.getByRole("heading", {
      name: /Pre-generate responsive images. Verify them before deploy./i,
    }),
  ).toBeVisible();
  await expect(
    heroSection.getByRole("link", { name: /Preview your first run/i }),
  ).toBeVisible();
  await expect(
    heroSection.getByRole("link", { name: /Read Docs/i }),
  ).toBeVisible();
  await expect(
    heroSection.getByRole("link", { name: /Contact/i }),
  ).toBeVisible();

  await expect(
    heroSection.getByRole("tablist", { name: /Package managers/i }),
  ).toBeVisible();

  await heroSection.getByRole("tab", { name: "pnpm" }).click();
  await expect(
    heroSection.getByText(
      `pnpm add --save-dev --save-exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    ),
  ).toBeVisible();

  await heroSection.getByRole("tab", { name: "bun" }).click();
  await expect(
    heroSection.getByText(
      `bun add --dev --exact ${IMAGEFORGE_CLI_PACKAGE_SPEC}`,
    ),
  ).toBeVisible();
  await expect(
    heroSection.getByText(
      `bunx ${IMAGEFORGE_CLI_PACKAGE_SPEC} ./public/images --dry-run`,
    ),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "CI integration guide" }),
  ).toHaveAttribute("href", "/docs/ci");
  await expect(
    page.getByRole("link", { name: "Check product fit" }),
  ).toHaveAttribute("href", "/docs/when-to-use");
  await expect(
    page.getByRole("link", { name: "Open the sourced comparison" }),
  ).toHaveAttribute("href", "/docs/image-service-comparison");
  await expect(
    page.getByRole("link", { name: "when-to-use decision guide" }),
  ).toHaveAttribute("href", "/docs/when-to-use");
  await expect(
    page.getByRole("link", { name: "Contribute a recipe" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/f-campana/imageforge/blob/main/CONTRIBUTING.md",
  );
});

test("docs and contact routes render expected primary headings", async ({
  page,
}) => {
  await page.goto("/docs");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Build the image pipeline/i,
    }),
  ).toBeVisible();
  await expect(page.locator('main a[href^="/docs/"]')).toHaveCount(13);
  await expect(
    page.locator("main").getByRole("link", { name: "Static HTML" }),
  ).toHaveAttribute("href", "/docs/static-html");
  await expect(
    page
      .locator("main")
      .getByRole("link", { name: "Image service comparison" }),
  ).toHaveAttribute("href", "/docs/image-service-comparison");

  await page.goto("/docs/image-service-comparison");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Compare ImageForge with managed image services/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Dated comparison matrix" }),
  ).toBeVisible();

  await page.goto("/docs/getting-started");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Get started with ImageForge CLI/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Documentation" }).getByRole("link", {
      name: "Getting started",
    }),
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/docs/nextjs");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Use ImageForge CLI with Next.js/i,
    }),
  ).toBeVisible();

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { level: 1, name: /Contact and feedback/i }),
  ).toBeVisible();
});

test.describe("mobile docs funnel", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the revised comparison and guide routes navigable without page overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Open the sourced comparison" }),
    ).toHaveAttribute("href", "/docs/image-service-comparison");

    await page.goto("/docs");
    await page.getByText("Browse documentation", { exact: true }).click();
    await page
      .getByRole("navigation", { name: "Documentation" })
      .getByRole("link", { name: "Image service comparison" })
      .click();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Compare ImageForge with managed image services/i,
      }),
    ).toBeVisible();
    await expect(
      page.locator('section[aria-labelledby="comparison-matrix"] table'),
    ).toBeHidden();
    expect(
      await page
        .locator('section[aria-labelledby="comparison-matrix"] article')
        .count(),
    ).toBeGreaterThan(0);

    for (const route of [
      "/",
      "/docs",
      "/docs/image-service-comparison",
      "/docs/getting-started",
      "/docs/nextjs",
    ]) {
      await page.goto(route);
      const widths = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(widths.document).toBeLessThanOrEqual(widths.viewport);
    }
  });
});

test("not-found route keeps the global skip-link target available", async ({
  page,
}) => {
  const response = await page.goto("/definitely-not-a-real-imageforge-route");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
});

test("benchmark route renders latest snapshot heading and summary sections", async ({
  page,
}) => {
  await page.goto("/benchmarks/latest");

  await expect(
    page.getByRole("heading", {
      name: /Latest approved benchmark snapshot/i,
    }),
  ).toBeVisible();

  await expect(page.getByText(/Peak throughput/i)).toBeVisible();
  await expect(page.getByText(/Head vs base deltas/i)).toBeVisible();
  await expect(page.getByText(/Recent approved snapshots/i)).toBeVisible();
});

test.describe("mobile benchmark surface", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("renders mobile benchmark cards", async ({ page }) => {
    await page.goto("/benchmarks/latest");

    const deltaCards = page.locator("[data-benchmark-mobile-delta-card]");
    const recentCards = page.locator("[data-benchmark-mobile-recent-card]");

    expect(await deltaCards.count()).toBeGreaterThan(0);
    expect(await recentCards.count()).toBeGreaterThan(0);
  });
});

test("security headers are present on landing and benchmark routes", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/benchmarks/latest",
    "/docs",
    "/docs/getting-started",
    "/contact",
  ]) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();
    const headers = response!.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
  }
});
