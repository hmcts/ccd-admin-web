import { expect, test } from "../e2e/fixtures";
import { mockFormSubmission } from "./mocks/form-submission.mocks";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { UserRolesPage } from "./page-objects/user-roles.po";

test.describe("user-role administration UI - positive", () => {
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

  test("submits a valid role and classification to the create endpoint", async ({ page }) => {
    const submission = await mockFormSubmission(page, "/createuserrole");
    const userRolesPage = new UserRolesPage(page);
    await userRolesPage.open();
    await userRolesPage.createLink.click();

    await expect(userRolesPage.classificationSelect).toHaveValue("PUBLIC");
    await userRolesPage.roleInput.fill("playwright-test-role");
    await userRolesPage.classificationSelect.selectOption("PRIVATE");
    await userRolesPage.submitButton.click();

    const formData = new URLSearchParams(submission.body);
    expect(submission.count).toBe(1);
    expect(submission.contentType).toContain("application/x-www-form-urlencoded");
    expect(formData.get("role")).toBe("playwright-test-role");
    expect(formData.get("classification")).toBe("PRIVATE");
    expect(formData.has("_csrf")).toBe(true);
  });

  test("safely cancels role deletion", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=role&roleParameter=playwright-test-role");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Role");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/user-roles");
  });
});
