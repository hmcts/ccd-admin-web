import { expect, test } from "../e2e/fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";
import { ImportDefinitionIntegrationPage } from "./page-objects/import-definition.po";

test.describe("import-definition UI state", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("requires confirmation before submitting a reindexing import", async ({ page }) => {
    const importDefinitionPage = new ImportDefinitionIntegrationPage(page);

    await importDefinitionPage.open();
    await expect(importDefinitionPage.heading).toBeVisible();
    await expect(importDefinitionPage.confirmationCheckbox).toBeDisabled();
    await expect(importDefinitionPage.submitButton).toBeEnabled();

    await importDefinitionPage.reindexCheckbox.check();
    await expect(importDefinitionPage.confirmationCheckbox).toBeEnabled();
    await expect(importDefinitionPage.submitButton).toBeDisabled();

    await importDefinitionPage.confirmationCheckbox.check();
    await expect(importDefinitionPage.submitButton).toBeEnabled();

    await importDefinitionPage.reindexCheckbox.uncheck();
    await expect(importDefinitionPage.confirmationCheckbox).toBeDisabled();
    await expect(importDefinitionPage.confirmationCheckbox).not.toBeChecked();
    await expect(importDefinitionPage.submitButton).toBeEnabled();
  });

  test("submits a selected definition spreadsheet to the import endpoint", async ({ page }) => {
    const submission = await mockFormSubmission(page, "/import");
    const importDefinitionPage = new ImportDefinitionIntegrationPage(page);
    await importDefinitionPage.open();

    await importDefinitionPage.fileInput.setInputFiles({
      name: "playwright-definition.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("playwright definition fixture"),
    });
    await expect(importDefinitionPage.fileInput).toHaveValue(/playwright-definition\.xlsx$/);

    await importDefinitionPage.submit();

    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("multipart/form-data");
    expect(submission.body).toContain('filename="playwright-definition.xlsx"');
  });
});
