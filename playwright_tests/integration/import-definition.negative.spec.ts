import { expect, test } from "./fixtures";

test.describe("import-definition UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("requires confirmation before submitting a reindexing import", async ({ importDefinitionIntegrationPage }) => {
    await importDefinitionIntegrationPage.open();
    await expect(importDefinitionIntegrationPage.heading).toBeVisible();
    await expect(importDefinitionIntegrationPage.confirmationCheckbox).toBeDisabled();
    await expect(importDefinitionIntegrationPage.submitButton).toBeEnabled();

    await importDefinitionIntegrationPage.reindexCheckbox.check();
    await expect(importDefinitionIntegrationPage.confirmationCheckbox).toBeEnabled();
    await expect(importDefinitionIntegrationPage.submitButton).toBeDisabled();

    await importDefinitionIntegrationPage.confirmationCheckbox.check();
    await expect(importDefinitionIntegrationPage.submitButton).toBeEnabled();

    await importDefinitionIntegrationPage.reindexCheckbox.uncheck();
    await expect(importDefinitionIntegrationPage.confirmationCheckbox).toBeDisabled();
    await expect(importDefinitionIntegrationPage.confirmationCheckbox).not.toBeChecked();
    await expect(importDefinitionIntegrationPage.submitButton).toBeEnabled();
  });
});
