import { expect, test } from "../e2e/fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";
import { DefinitionsPage } from "./page-objects/definitions.po";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { JurisdictionSelectionPage } from "./page-objects/jurisdiction-selection.po";

test.describe("definition administration UI - positive", () => {
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

  test("submits a valid definition to the create endpoint", async ({ page }) => {
    const submission = await mockFormSubmission(page, "/createdefinition");
    const definitionsPage = new DefinitionsPage(page);
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);
    await definitionsPage.openJurisdictionSelection();
    const jurisdiction = await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await definitionsPage.createLink.click();

    await definitionsPage.descriptionInput.fill("Playwright definition");
    await expect(definitionsPage.jurisdictionId).toHaveText(jurisdiction);
    await definitionsPage.submitButton.click();

    const formData = new URLSearchParams(submission.body);
    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("application/x-www-form-urlencoded");
    expect(formData.get("description")).toBe("Playwright definition");
    expect(formData.has("_csrf")).toBe(true);
  });

  test("safely cancels definition deletion", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=definition&jurisdictionId=PLAYWRIGHT&version=1");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete Definition");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/definitions");
  });
});
