import { expect, type Request, type Response, test as baseTest } from "@playwright/test";
import fs from "node:fs/promises";
import { AdminWebPage } from "./page-objects/admin-web.po";
import { IdamLoginPage } from "./page-objects/idam-login.po";
import { ImportDefinitionPage } from "./page-objects/import-definition.po";

interface HttpFailure {
  error?: string;
  method: string;
  resourceType: string;
  status?: number;
  url: string;
}

const maximumTrackedHttpFailures = 50;
const monitoredResourceTypes = new Set(["document", "fetch", "xhr"]);

function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return url.split(/[?#]/, 1)[0];
  }
}

function shouldMonitor(request: Request): boolean {
  return monitoredResourceTypes.has(request.resourceType());
}

function recordHttpFailure(failures: HttpFailure[], failure: HttpFailure): void {
  failures.push(failure);
  if (failures.length > maximumTrackedHttpFailures) {
    failures.shift();
  }
}

function failureSummary(failures: HttpFailure[]): string {
  const details = failures.slice(0, 5).map((failure) => {
    const outcome = failure.status ? `HTTP ${failure.status}` : failure.error || "request failed";
    return `${outcome}: ${failure.method} ${failure.url}`;
  });
  const remaining = failures.length - details.length;
  return [`Observed ${failures.length} failed HTTP request(s)`, ...details, remaining > 0 ? `...and ${remaining} more` : ""]
    .filter(Boolean)
    .join(" | ");
}

interface PageFixtures {
  adminWebPage: AdminWebPage;
  idamPage: IdamLoginPage;
  importDefinitionPage: ImportDefinitionPage;
}

export const test = baseTest.extend<PageFixtures>({
  page: async ({ page }, use, testInfo) => {
    const failures: HttpFailure[] = [];
    const onResponse = (response: Response): void => {
      const request = response.request();
      if (response.status() < 400 || !shouldMonitor(request)) {
        return;
      }
      recordHttpFailure(failures, {
        method: request.method(),
        resourceType: request.resourceType(),
        status: response.status(),
        url: sanitizeUrl(response.url()),
      });
    };
    const onRequestFailed = (request: Request): void => {
      if (!shouldMonitor(request)) {
        return;
      }
      recordHttpFailure(failures, {
        error: request.failure()?.errorText || "Unknown request failure",
        method: request.method(),
        resourceType: request.resourceType(),
        url: sanitizeUrl(request.url()),
      });
    };

    page.on("response", onResponse);
    page.on("requestfailed", onRequestFailed);
    try {
      await use(page);
    } finally {
      page.off("response", onResponse);
      page.off("requestfailed", onRequestFailed);

      if ((testInfo.status === "failed" || testInfo.status === "timedOut") && failures.length > 0) {
        testInfo.annotations.push({ type: "HTTP failures", description: failureSummary(failures) });
        const attachmentPath = testInfo.outputPath("http-failures.json");
        try {
          await fs.writeFile(attachmentPath, JSON.stringify(failures, null, 2), "utf8");
          await testInfo.attach("http-failures.json", {
            contentType: "application/json",
            path: attachmentPath,
          });
        } catch (error) {
          testInfo.annotations.push({
            type: "HTTP failure attachment error",
            description: String(error),
          });
        }
      }
    }
  },
  adminWebPage: async ({ page }, use) => {
    await use(new AdminWebPage(page));
  },
  idamPage: async ({ page }, use) => {
    await use(new IdamLoginPage(page));
  },
  importDefinitionPage: async ({ page }, use) => {
    await use(new ImportDefinitionPage(page));
  },
});

export { expect };
