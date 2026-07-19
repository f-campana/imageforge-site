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

test("docs index matches baseline on desktop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs");
  await stabilizePage(page);

  await expect(page.locator("main")).toHaveScreenshot(
    "docs-index-desktop.png",
    {
      animations: "disabled",
    },
  );
});

test.describe("docs mobile visual", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("docs index matches baseline on mobile", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/docs");
    await stabilizePage(page);

    await expect(page.locator("main")).toHaveScreenshot(
      "docs-index-mobile.png",
      {
        animations: "disabled",
      },
    );
  });
});
