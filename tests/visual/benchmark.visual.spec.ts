import { expect, test } from "@playwright/test";

async function stabilizePage(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0ms !important;
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
      }
    `,
  });
}

test("benchmark hero and summary section matches baseline on desktop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/benchmarks/latest");
  await stabilizePage(page);

  const benchmarkTopSection = page.locator("main > section").first();
  await expect(benchmarkTopSection).toBeVisible();

  await expect(benchmarkTopSection).toHaveScreenshot(
    "benchmark-latest-desktop.png",
    {
      animations: "disabled",
    },
  );
});

test.describe("benchmark mobile visual", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("benchmark hero and summary section matches baseline on mobile", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/benchmarks/latest");
    await stabilizePage(page);

    const benchmarkTopSection = page.locator("main > section").first();
    await expect(benchmarkTopSection).toBeVisible();

    await expect(benchmarkTopSection).toHaveScreenshot(
      "benchmark-latest-mobile.png",
      {
        animations: "disabled",
      },
    );
  });
});
