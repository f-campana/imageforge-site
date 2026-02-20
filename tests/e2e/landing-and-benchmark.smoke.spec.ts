import { expect, test } from "@playwright/test";

test("landing page renders hero, CTA, and package-manager tabs", async ({
  page,
}) => {
  await page.goto("/");

  const heroSection = page.locator("section#top");

  await expect(
    heroSection.getByRole("heading", {
      name: /Optimize once, deploy everywhere, pay nothing monthly/i,
    }),
  ).toBeVisible();
  await expect(
    heroSection.getByRole("link", { name: /Get Started/i }),
  ).toBeVisible();

  await expect(
    heroSection.getByRole("tablist", { name: /Package managers/i }),
  ).toBeVisible();

  await heroSection.getByRole("tab", { name: "pnpm" }).click();
  await expect(
    heroSection.getByText("pnpm add -g @imageforge/cli"),
  ).toBeVisible();

  await heroSection.getByRole("tab", { name: "bun" }).click();
  await expect(
    heroSection.getByText("bun add -g @imageforge/cli"),
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
  for (const route of ["/", "/benchmarks/latest"]) {
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
