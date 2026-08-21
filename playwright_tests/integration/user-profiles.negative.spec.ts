import { expect, test } from "./fixtures";

test.describe("user-profile administration UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("validates required profile fields", async ({ jurisdictionSelectionPage, userProfilesPage }) => {
    await userProfilesPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await userProfilesPage.createLink.click();

    await userProfilesPage.submitButton.click();
    await expect(userProfilesPage.form.locator("#idamId-error")).toHaveText("Enter IdAM Id");
    await expect(userProfilesPage.form.locator("#jurisdictionDropdown-error")).toHaveText("Choose a jurisdiction");
    await expect(userProfilesPage.form.locator("#caseTypeDropdown-error")).toHaveText("Choose a case type");
    await expect(userProfilesPage.form.locator("#stateDropdown-error")).toHaveText("Choose a state");

  });

  test("requires a delete decision", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=user&idamId=playwright-test%40example.com");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Profile");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");
  });
});
