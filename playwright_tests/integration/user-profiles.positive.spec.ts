import { expect, test } from "./fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";

test.describe("user-profile administration UI - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("selects a jurisdiction and renders its user profiles", async ({
    jurisdictionSelectionPage,
    page,
    userProfilesPage,
  }) => {
    await userProfilesPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();

    await expect(page).toHaveURL((url) => url.pathname === "/userprofiles");
    await expect(userProfilesPage.table).toBeVisible();
    await expect(userProfilesPage.table.locator("thead tr:last-child th")).toHaveText([
      "User IdAM ID",
      "Work basket default jurisdiction",
      "Work basket default case type",
      "Work basket default state",
      "Action",
    ]);
    await expect(userProfilesPage.createLink).toBeVisible();
  });

  test("submits a complete user profile to the create endpoint", async ({
    jurisdictionSelectionPage,
    page,
    userProfilesPage,
  }) => {
    const submission = await mockFormSubmission(page, "/createuser");
    await userProfilesPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await userProfilesPage.createLink.click();

    await expect(userProfilesPage.form).toBeVisible();
    await userProfilesPage.idamIdInput.fill("playwright-profile@example.com");
    const workBasket = await userProfilesPage.selectFirstCompleteWorkBasket();
    await userProfilesPage.submitButton.click();

    const formData = new URLSearchParams(submission.body);
    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("application/x-www-form-urlencoded");
    expect(formData.get("idamId")).toBe("playwright-profile@example.com");
    expect(formData.get("jurisdictionDropdown")).toBe(workBasket.jurisdiction);
    expect(formData.get("caseTypeDropdown")).toBe(workBasket.caseType);
    expect(formData.get("stateDropdown")).toBe(workBasket.state);
    expect(formData.has("_csrf")).toBe(true);
  });

  test("safely cancels profile deletion", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=user&idamId=playwright-test%40example.com");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Profile");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/userprofiles");
  });
});
