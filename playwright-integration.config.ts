import { defineConfig, devices } from "@playwright/test";
import { sessionStoragePath } from "./playwright_tests/e2e/session";

function resolveWorkerCount(): number | undefined {
  const configured = process.env.FUNCTIONAL_TESTS_WORKERS?.trim();
  if (!configured) {
    return process.env.CI ? 3 : undefined;
  }

  const workerCount = Number.parseInt(configured, 10);
  return Number.isFinite(workerCount) && workerCount > 0
    ? workerCount
    : process.env.CI ? 3 : undefined;
}

export default defineConfig({
  testDir: "./playwright_tests/integration",
  globalSetup: "./playwright_tests/e2e/session.global-setup.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: resolveWorkerCount(),
  timeout: 60_000,
  expect: {
    timeout: 40_000,
  },
  outputDir: "functional-output/integration/artifacts",
  reporter: [
    ["line"],
    ["html", { outputFolder: "functional-output/integration/html", open: "never" }],
    ["junit", { outputFile: "functional-output/integration/results.xml" }],
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
