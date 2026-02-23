/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */
const config = {
  plugins: ["@stryker-mutator/vitest-runner"],
  mutate: ["hooks/usePrefersReducedMotion.ts", "lib/seo/schema.ts"],
  testRunner: "vitest",
  coverageAnalysis: "off",
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: {
    fileName: ".tmp/mutation/html/report.html",
  },
  jsonReporter: {
    fileName: ".tmp/mutation/report.json",
  },
  tempDirName: ".tmp/mutation/.stryker-tmp",
  cleanTempDir: "always",
  vitest: {
    configFile: "vitest.config.ts",
  },
};

export default config;
