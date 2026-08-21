import { expect, test } from "./fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";

test.describe("import-definition UI - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("submits a selected definition spreadsheet to the import endpoint", async ({
    importDefinitionIntegrationPage,
    page,
  }) => {
    const submission = await mockFormSubmission(page, "/import");
    await importDefinitionIntegrationPage.open();

    await importDefinitionIntegrationPage.fileInput.setInputFiles({
      name: "playwright-definition.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("playwright definition fixture"),
    });
    await expect(importDefinitionIntegrationPage.fileInput).toHaveValue(/playwright-definition\.xlsx$/);

    await importDefinitionIntegrationPage.submit();

    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("multipart/form-data");
    expect(submission.body).toContain('filename="playwright-definition.xlsx"');
  });

  test("submits an approved definition spreadsheet with reindexing enabled", async ({
    importDefinitionIntegrationPage,
    page,
  }) => {
    const submission = await mockFormSubmission(page, "/import");
    await importDefinitionIntegrationPage.open();

    await importDefinitionIntegrationPage.fileInput.setInputFiles({
      name: "playwright-reindex-definition.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("playwright reindex definition fixture"),
    });
    await importDefinitionIntegrationPage.reindexCheckbox.check();
    await importDefinitionIntegrationPage.confirmationCheckbox.check();
    await expect(importDefinitionIntegrationPage.submitButton).toBeEnabled();

    await importDefinitionIntegrationPage.submit();

    expect(submission.count).toBe(1);
    expect(submission.body).toContain('filename="playwright-reindex-definition.xlsx"');
    expect(submission.body).toContain('name="reindex"');
    expect(submission.body).toContain('name="confirm"');
  });
});
