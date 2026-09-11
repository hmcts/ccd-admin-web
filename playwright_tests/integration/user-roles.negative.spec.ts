import { expect, test } from "./fixtures";

test.describe("user-role administration UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("validates an empty role before submitting the create form", async ({ page, userRolesPage }) => {
    await userRolesPage.open();
    await userRolesPage.createLink.click();

    await expect(userRolesPage.form).toBeVisible();
    await userRolesPage.submitButton.click();

    await expect(userRolesPage.roleValidationError).toHaveText("Enter role");
    await expect(page).toHaveURL((url) => url.pathname === "/create-user-role-form");

  });

  test("requires a delete decision", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=role&roleParameter=playwright-test-role");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Role");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");
  });
});
