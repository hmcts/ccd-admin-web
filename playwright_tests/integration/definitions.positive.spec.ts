import { expect, test } from "./fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";
import { mockDefinitionFormNavigation } from "./mocks/form-navigation.mocks";

test.describe("definition administration UI - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("selects a jurisdiction and renders its definitions", async ({ definitionsPage, jurisdictionSelectionPage, page }) => {
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

  test("submits a valid definition to the create endpoint", async ({
    definitionsPage,
    page,
  }) => {
    const submission = await mockFormSubmission(page, "/createdefinition");
    const jurisdiction = await mockDefinitionFormNavigation(page);
    await definitionsPage.openJurisdictionSelection();

    await definitionsPage.descriptionInput.fill("Playwright definition");
    await expect(definitionsPage.jurisdictionId).toHaveText(jurisdiction);
    await definitionsPage.submitButton.click();

    const formData = new URLSearchParams(submission.body);
    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("application/x-www-form-urlencoded");
    expect(formData.get("description")).toBe("Playwright definition");
    expect(formData.has("_csrf")).toBe(true);
  });

  test("safely cancels definition deletion", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=definition&jurisdictionId=PLAYWRIGHT&version=1");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete Definition");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/definitions");
  });
});
