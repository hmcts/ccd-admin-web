import { expect, test } from "../e2e/fixtures";
import { mockWelshDictionaryDownload, mockWelshDictionaryFailure } from "./mocks/welsh-dictionary.mocks";
import { WelshDictionaryPage } from "./page-objects/welsh-dictionary.po";
import { ERROR_TEXT_COLOUR } from "../support/assertionData";

test.describe("mocked Welsh dictionary UI states", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.heading).toBeVisible();
  });

  test("downloads a CSV after a successful mocked dictionary response", async ({ page }) => {
    const welshDictionaryPage = new WelshDictionaryPage(page);
    const requests = await mockWelshDictionaryDownload(page, "English phrase,Welsh phrase");

    await welshDictionaryPage.open();
    await expect(welshDictionaryPage.heading).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await welshDictionaryPage.download();
    const download = await downloadPromise;

    await expect(welshDictionaryPage.results).toContainText("[STARTING] Invoking get Welsh dictionary");
    await expect(welshDictionaryPage.results).toContainText("[FINISHED] completed");
    expect(download.suggestedFilename()).toMatch(/^\d+\.csv$/);
    expect(requests.count).toBe(1);
  });

  test("renders a mocked dictionary failure as a red error", async ({ page }) => {
    const welshDictionaryPage = new WelshDictionaryPage(page);
    await mockWelshDictionaryFailure(page, "Mock dictionary failure");

    await welshDictionaryPage.open();
    await welshDictionaryPage.download();

    const errorMessage = welshDictionaryPage.results.getByText("Error occurred: Mock dictionary failure");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveCSS("color", ERROR_TEXT_COLOUR);
  });
});
