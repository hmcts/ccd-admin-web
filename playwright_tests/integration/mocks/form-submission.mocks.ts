import { type Page } from "@playwright/test";

export interface CapturedFormSubmission {
  body: string;
  contentType: string;
  count: number;
}

export async function mockFormSubmission(page: Page, path: string): Promise<CapturedFormSubmission> {
  const submission: CapturedFormSubmission = {
    body: "",
    contentType: "",
    count: 0,
  };

  await page.route(`**${path}`, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    submission.body = request.postData() || "";
    submission.contentType = request.headers()["content-type"] || "";
    submission.count += 1;

    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>Mock upload accepted</body></html>",
    });
  });

  return submission;
}
