import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright_tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  expect: {
    timeout: 15_000,
  },
  outputDir: "functional-output/artifacts",
  reporter: [
    ["line"],
    ["html", { outputFolder: "functional-output/html", open: "never" }],
    ["junit", { outputFile: "functional-output/results.xml" }],
  ],
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3100",
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
