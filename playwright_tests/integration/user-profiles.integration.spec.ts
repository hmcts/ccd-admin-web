import { expect, test } from "../e2e/fixtures";
import { DeleteConfirmationPage } from "./page-objects/delete-confirmation.po";
import { JurisdictionSelectionPage } from "./page-objects/jurisdiction-selection.po";
import { UserProfilesPage } from "./page-objects/user-profiles.po";

test.describe("user-profile administration UI", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("selects a jurisdiction and renders its user profiles", async ({ page }) => {
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);
    const userProfilesPage = new UserProfilesPage(page);

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

  test("validates required profile fields and populates dependent selections", async ({ page }) => {
    const jurisdictionSelectionPage = new JurisdictionSelectionPage(page);
    const userProfilesPage = new UserProfilesPage(page);
    await userProfilesPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await userProfilesPage.createLink.click();

    await userProfilesPage.submitButton.click();
    await expect(userProfilesPage.form.locator("#idamId-error")).toHaveText("Enter IdAM Id");
    await expect(userProfilesPage.form.locator("#jurisdictionDropdown-error")).toHaveText("Choose a jurisdiction");
    await expect(userProfilesPage.form.locator("#caseTypeDropdown-error")).toHaveText("Choose a case type");
    await expect(userProfilesPage.form.locator("#stateDropdown-error")).toHaveText("Choose a state");

    const jurisdictionValues = await userProfilesPage.jurisdictionSelect
      .locator('option:not([value=""])')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
    for (const jurisdiction of jurisdictionValues) {
      await userProfilesPage.jurisdictionSelect.selectOption(jurisdiction);
      if (await userProfilesPage.caseTypeSelect.locator('option:not([value=""])').count()) {
        break;
      }
    }
    const caseType = userProfilesPage.caseTypeSelect.locator('option:not([value=""])').first();
    await expect(caseType).toBeAttached();
    const caseTypeValue = await caseType.getAttribute("value");
    if (!caseTypeValue) {
      throw new Error("No case type is available for the selected integration-test jurisdictions");
    }
    await userProfilesPage.caseTypeSelect.selectOption(caseTypeValue);
    await expect(userProfilesPage.stateSelect.locator('option:not([value=""])').first()).toBeAttached();
  });

  test("requires a delete decision and safely cancels profile deletion", async ({ page }) => {
    const deleteConfirmationPage = new DeleteConfirmationPage(page);
    await page.goto("/deleteitem?item=user&idamId=playwright-test%40example.com");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete User Profile");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");

    await deleteConfirmationPage.cancelDeletion();
    await expect(page).toHaveURL((url) => url.pathname === "/userprofiles");
  });
});
