import { expect, test } from "../e2e/fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";
import { ManageWelshTranslationsPage } from "./page-objects/manage-welsh-translations.po";

test.describe("manage Welsh translations UI", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("submits a selected translations CSV to the upload endpoint", async ({ page }) => {
    const submission = await mockFormSubmission(page, "/manageWelshDictionary");
    const manageWelshTranslationsPage = new ManageWelshTranslationsPage(page);
    await manageWelshTranslationsPage.open();

    await expect(manageWelshTranslationsPage.heading).toHaveText("Import Welsh Translations");
    await manageWelshTranslationsPage.fileInput.setInputFiles({
      name: "playwright-translations.csv",
      mimeType: "text/csv",
      buffer: Buffer.from('"English phrase","Welsh phrase"'),
    });
    await expect(manageWelshTranslationsPage.fileInput).toHaveValue(/playwright-translations\.csv$/);

    await manageWelshTranslationsPage.submit();

    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("multipart/form-data");
    expect(submission.body).toContain('filename="playwright-translations.csv"');
  });
});
