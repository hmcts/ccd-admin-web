import { expect, test } from "../e2e/fixtures";
import { ImportDefinitionIntegrationPage } from "./page-objects/import-definition.po";

test.describe("import-definition UI - negative", () => {
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
});
