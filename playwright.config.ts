import { defineConfig, devices } from "@playwright/test";
import { sessionStoragePath } from "./playwright_tests/e2e/session";

export default defineConfig({
  testDir: "./playwright_tests/e2e",
  globalSetup: "./playwright_tests/e2e/session.global-setup.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  expect: {
    timeout: 15_000,
  },
  outputDir: "functional-output/e2e/artifacts",
  reporter: [
    ["line"],
    ["html", { outputFolder: "functional-output/e2e/html", open: "never" }],
    ["junit", { outputFile: "functional-output/e2e/results.xml" }],
  ],
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3100",
    ignoreHTTPSErrors: true,
    storageState: sessionStoragePath(),
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
