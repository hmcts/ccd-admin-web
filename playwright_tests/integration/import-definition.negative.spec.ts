import { expect, test } from "./fixtures";

test.describe("import-definition UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("requires confirmation before submitting a reindexing import", async ({ importDefinitionPage }) => {
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
