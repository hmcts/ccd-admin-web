import { type Page } from "@playwright/test";

export async function mockWelshDictionaryDownload(page: Page, csv: string): Promise<{ count: number }> {
  const requests = { count: 0 };

  await page.route("**/dictionary", async (route) => {
    requests.count += 1;
    await route.fulfill({
      status: 200,
      contentType: "text/csv; charset=utf-8",
      body: csv,
    });
  });

  return requests;
}

export async function mockWelshDictionaryFailure(page: Page, message: string): Promise<void> {
  await page.route("**/dictionary", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "text/plain",
      body: message,
    });
  });
}
