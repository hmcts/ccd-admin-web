import { expect, test } from "./fixtures";
import { GOVUK_ERROR_TEXT_COLOURS } from "../support/assertionData";

test.describe("definition administration UI - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("rejects a definition without a description", async ({ definitionsPage, jurisdictionSelectionPage }) => {
    await definitionsPage.openJurisdictionSelection();
    await jurisdictionSelectionPage.selectFirstJurisdiction();
    await jurisdictionSelectionPage.submit();
    await definitionsPage.createLink.click();

    await expect(definitionsPage.form).toBeVisible();
    await definitionsPage.submitButton.click();
    await expect(definitionsPage.descriptionValidationError).toHaveText("Enter a description");
    await expect(definitionsPage.descriptionValidationError).toHaveClass(/govuk-error-message/);
    const errorColour = await definitionsPage.descriptionValidationError.evaluate(
      (element) => getComputedStyle(element).color,
    );
    expect(GOVUK_ERROR_TEXT_COLOURS).toContain(errorColour);
  });

  test("requires a delete decision", async ({ deleteConfirmationPage, page }) => {
    await page.goto("/deleteitem?item=definition&jurisdictionId=PLAYWRIGHT&version=1");
    await expect(deleteConfirmationPage.heading).toHaveText("Confirm Delete Definition");

    await deleteConfirmationPage.submitButton.click();
    await expect(deleteConfirmationPage.validationError).toContainText("Please choose Yes or No");
  });
});
