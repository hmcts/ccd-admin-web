import { expect, test } from "../e2e/fixtures";
import { DefinitionsPage } from "./page-objects/definitions.po";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { JurisdictionSelectionPage } from "./page-objects/jurisdiction-selection.po";

test.describe("definition administration UI", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("selects a jurisdiction and renders its definitions", async ({ page }) => {
    const definitionsPage = new DefinitionsPage(page);
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);

    await definitionsPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();

    await expect(page).toHaveURL((url) => url.pathname === "/definitions");
    await expect(definitionsPage.table).toBeVisible();
    await expect(definitionsPage.table.locator("thead tr:last-child th")).toHaveText([
      "Jurisdiction",
      "Case Type(s)",
      "Description",
      "Status",
      "Action",
    ]);
    await expect(definitionsPage.createLink).toBeVisible();
  });

  test("renders jurisdiction details and validates the definition form", async ({ page }) => {
    const definitionsPage = new DefinitionsPage(page);
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);
    await definitionsPage.openJurisdictionSelection();
    const jurisdiction = await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await definitionsPage.createLink.click();

    await expect(definitionsPage.form).toBeVisible();
    await expect(definitionsPage.jurisdictionId).toHaveText(jurisdiction);
    await definitionsPage.submitButton.click();
    await expect(definitionsPage.descriptionValidationError).toHaveText("Enter a description");

    await definitionsPage.cancelLink.click();
    await expect(page).toHaveURL((url) => url.pathname === "/definitions");
  });

  test("requires a delete decision and safely cancels definition deletion", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=definition&jurisdictionId=PLAYWRIGHT&version=1");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete Definition");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/definitions");
  });
});
