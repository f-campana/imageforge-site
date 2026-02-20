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

test("landing hero and install surface matches baseline on desktop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await stabilizePage(page);

  const heroSection = page.locator("section#top");
  await expect(heroSection).toBeVisible();

  await expect(heroSection).toHaveScreenshot("landing-hero-desktop.png", {
    animations: "disabled",
  });
});

test.describe("landing mobile visual", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("landing hero and install surface matches baseline on mobile", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await stabilizePage(page);

    const heroSection = page.locator("section#top");
    await expect(heroSection).toBeVisible();

    await expect(heroSection).toHaveScreenshot("landing-hero-mobile.png", {
      animations: "disabled",
    });
  });
});
