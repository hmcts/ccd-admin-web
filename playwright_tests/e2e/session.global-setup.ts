import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { AdminWebPage } from "./page-objects/admin-web.po";
import { IdamLoginPage } from "./page-objects/idam-login.po";
import { sessionStoragePath } from "./session";

const baseUrl = process.env.TEST_URL || "http://localhost:3100";
const storageStatePath = sessionStoragePath(baseUrl);

function isTransientNavigationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return [
    "ERR_CONNECTION_CLOSED",
    "ERR_CONNECTION_RESET",
    "ERR_CONNECTION_TIMED_OUT",
    "ERR_INTERNET_DISCONNECTED",
    "ERR_NAME_NOT_RESOLVED",
    "ERR_NETWORK_CHANGED",
    "ERR_TIMED_OUT",
  ].some((errorCode) => message.includes(errorCode));
}

async function navigateToApplication(page: Page): Promise<void> {
  const maximumAttempts = 3;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      return;
    } catch (error) {
      if (attempt === maximumAttempts || !isTransientNavigationError(error)) {
        throw error;
      }
      await page.waitForTimeout(1_000 * attempt);
    }
  }
}

async function hasAuthenticatedLandingPage(page: Page): Promise<boolean> {
  const adminWebPage = new AdminWebPage(page);
  await navigateToApplication(page);
  return adminWebPage.heading.isVisible({ timeout: 10_000 }).catch(() => false);
}

async function canReuseSession(browser: Browser): Promise<boolean> {
  if (!fs.existsSync(storageStatePath)) {
    return false;
  }

  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({
      baseURL: baseUrl,
      ignoreHTTPSErrors: true,
      storageState: storageStatePath,
    });
    return await hasAuthenticatedLandingPage(await context.newPage());
  } catch {
    return false;
  } finally {
    await context?.close();
  }
}

async function captureSession(browser: Browser): Promise<void> {
  const username = process.env.PLAYWRIGHT_USERNAME;
  const password = process.env.PLAYWRIGHT_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD are required to capture an authenticated Playwright session",
    );
  }

  const context = await browser.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const page = await context.newPage();
    const adminWebPage = new AdminWebPage(page);
    const idamPage = new IdamLoginPage(page);

    await navigateToApplication(page);
    await idamPage.login({ username, password });

    try {
      await adminWebPage.heading.waitFor({ state: "visible", timeout: 40_000 });
    } catch (error) {
      const idamError = await idamPage.visibleErrorMessage();
      if (idamError) {
        throw new Error(`IdAM login failed while capturing the shared session: ${idamError}`, { cause: error });
      }
      throw error;
    }

    await context.storageState({ path: storageStatePath });
    fs.chmodSync(storageStatePath, 0o600);
  } finally {
    await context.close();
  }
}

export default async function globalSetup(): Promise<void> {
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const browser = await chromium.launch();
  try {
    if (await canReuseSession(browser)) {
      return;
    }
    await captureSession(browser);
  } finally {
    await browser.close();
  }
}
