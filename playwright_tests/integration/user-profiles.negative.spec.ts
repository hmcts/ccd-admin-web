import { expect, test } from "./fixtures";
import { mockUserProfileFormNavigation } from "./mocks/form-navigation.mocks";

test.describe("user-profile administration UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("validates required profile fields", async ({ page, userProfilesPage }) => {
    await mockUserProfileFormNavigation(page);
    await userProfilesPage.openJurisdictionSelection();

    await userProfilesPage.submitButton.click();
    await expect(userProfilesPage.idamIdValidationError).toHaveText("Enter IdAM Id");
    await expect(userProfilesPage.form.locator("#jurisdictionDropdown-error")).toHaveText("Choose a jurisdiction");
    await expect(userProfilesPage.form.locator("#caseTypeDropdown-error")).toHaveText("Choose a case type");
    await expect(userProfilesPage.form.locator("#stateDropdown-error")).toHaveText("Choose a state");

  });

  test("validates a malformed IdAM email address", async ({ page, userProfilesPage }) => {
    await mockUserProfileFormNavigation(page);
    await userProfilesPage.openJurisdictionSelection();

    await userProfilesPage.idamIdInput.fill("not-an-email-address");
    await userProfilesPage.submitButton.click();

    await expect(userProfilesPage.idamIdValidationError).toHaveText("Email address invalid");
    await expect(page).toHaveURL((url) => url.pathname === "/createuser");
  });

  test("requires a delete decision", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=user&idamId=playwright-test%40example.com");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Profile");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");
  });
});
