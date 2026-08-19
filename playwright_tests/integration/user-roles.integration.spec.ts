import { expect, test } from "../e2e/fixtures";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { UserRolesPage } from "./page-objects/user-roles.po";

test.describe("user-role administration UI", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("renders the role list and administration controls", async ({ page }) => {
    const userRolesPage = new UserRolesPage(page);
    await userRolesPage.open();

    await expect(userRolesPage.table).toBeVisible();
    await expect(userRolesPage.table.locator("thead tr:last-child th")).toHaveText([
      "Role",
      "Security Classification",
      "Action",
    ]);
    await expect(userRolesPage.createLink).toBeVisible();
  });

  test("validates an empty role before submitting the create form", async ({ page }) => {
    const userRolesPage = new UserRolesPage(page);
    await userRolesPage.open();
    await userRolesPage.createLink.click();

    await expect(userRolesPage.form).toBeVisible();
    await expect(userRolesPage.classificationSelect).toHaveValue("PUBLIC");
    await userRolesPage.submitButton.click();

    await expect(userRolesPage.roleValidationError).toHaveText("Enter role");
    await expect(page).toHaveURL((url) => url.pathname === "/create-user-role-form");

    await userRolesPage.cancelLink.click();
    await expect(page).toHaveURL((url) => url.pathname === "/user-roles");
  });

  test("requires a delete decision and safely cancels role deletion", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=role&roleParameter=playwright-test-role");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Role");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/user-roles");
  });
});
