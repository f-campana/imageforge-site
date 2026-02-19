import { defineConfig, devices } from "@playwright/test";

const VISUAL_PORT = 3208;
const VISUAL_BASE_URL = `http://127.0.0.1:${VISUAL_PORT.toString()}`;
const VISUAL_ENV =
  "NEXT_PUBLIC_SITE_URL=https://example.com BENCHMARK_ENABLE_LOCAL_FIXTURE=1 BENCHMARK_SNAPSHOT_FIXTURE=sample";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate:
    "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  outputDir: "test-results/visual",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/visual", open: "never" }],
  ],
  use: {
    baseURL: VISUAL_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: `${VISUAL_ENV} pnpm build && ${VISUAL_ENV} pnpm exec next start --hostname 127.0.0.1 --port ${VISUAL_PORT.toString()}`,
    url: VISUAL_BASE_URL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
