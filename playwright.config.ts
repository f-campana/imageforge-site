import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 3207;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT.toString()}`;
const E2E_ENV =
  "NEXT_PUBLIC_SITE_URL=https://example.com BENCHMARK_ENABLE_LOCAL_FIXTURE=1 BENCHMARK_SNAPSHOT_FIXTURE=sample";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: "test-results/e2e",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/e2e", open: "never" }],
  ],
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
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
    command: `${E2E_ENV} pnpm build && ${E2E_ENV} pnpm exec next start --hostname 127.0.0.1 --port ${E2E_PORT.toString()}`,
    url: E2E_BASE_URL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
  },
});
