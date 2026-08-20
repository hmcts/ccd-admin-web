import { expect, test } from "../e2e/fixtures";
import { DefinitionsPage } from "./page-objects/definitions.po";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { JurisdictionSelectionPage } from "./page-objects/jurisdiction-selection.po";

test.describe("definition administration UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("rejects a definition without a description", async ({ page }) => {
    const definitionsPage = new DefinitionsPage(page);
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);
    await definitionsPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await definitionsPage.createLink.click();

    await expect(definitionsPage.form).toBeVisible();
    await definitionsPage.submitButton.click();
    await expect(definitionsPage.descriptionValidationError).toHaveText("Enter a description");
  });

  test("requires a delete decision", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=definition&jurisdictionId=PLAYWRIGHT&version=1");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete Definition");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");
  });
});
