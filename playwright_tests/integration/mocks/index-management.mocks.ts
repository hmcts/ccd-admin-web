import { type Page } from "@playwright/test";

export async function mockElasticsearchIndexing(
  page: Page,
  caseTypes: readonly string[],
): Promise<string[]> {
  const requestedCaseTypes: string[] = [];

  await page.route("**/elasticsearch/case-types", async (route) => {
    await route.fulfill({ json: caseTypes });
  });

  await page.route("**/elasticsearch/index?ctid=*", async (route) => {
    const caseType = new URL(route.request().url()).searchParams.get("ctid");
    if (caseType) {
      requestedCaseTypes.push(caseType);
    }

    await route.fulfill({
      json: {
        case_types: {
          MockJurisdiction: {},
        },
      },
    });
  });

  return requestedCaseTypes;
}

export async function mockGlobalSearchIndexingFailure(
  page: Page,
  message: string,
  status = 500,
): Promise<void> {
  await page.route("**/elastic-support/global-search/index", async (route) => {
    await route.fulfill({
      status,
      contentType: "text/plain",
      body: message,
    });
  });
}

export async function mockElasticsearchCaseTypesFailure(
  page: Page,
  message: string,
  status = 500,
): Promise<void> {
  await page.route("**/elasticsearch/case-types", async (route) => {
    await route.fulfill({
      status,
      contentType: "text/plain",
      body: message,
    });
  });
}

export async function mockElasticsearchIndexingFailure(
  page: Page,
  caseTypes: readonly string[],
  failedCaseType: string,
  message: string,
  status = 500,
): Promise<string[]> {
  const requestedCaseTypes: string[] = [];

  await page.route("**/elasticsearch/case-types", async (route) => {
    await route.fulfill({ json: caseTypes });
  });

  await page.route("**/elasticsearch/index?ctid=*", async (route) => {
    const caseType = new URL(route.request().url()).searchParams.get("ctid");
    if (caseType) {
      requestedCaseTypes.push(caseType);
    }

    if (caseType === failedCaseType) {
      await route.fulfill({ status, contentType: "text/plain", body: message });
      return;
    }

    await route.fulfill({ json: { case_types: { MockJurisdiction: {} } } });
  });

  return requestedCaseTypes;
}

export async function mockGlobalSearchIndexingSuccess(page: Page): Promise<{ count: number }> {
  const requests = { count: 0 };

  await page.route("**/elastic-support/global-search/index", async (route) => {
    requests.count += 1;
    await route.fulfill({ status: 200, body: "" });
  });

  return requests;
}
