import { expect, test } from "./fixtures";
import { mockWelshDictionaryDownload } from "./mocks/welsh-dictionary.mocks";

test.describe("mocked Welsh dictionary UI states - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("downloads a CSV after a successful mocked dictionary response", async ({ page, welshDictionaryPage }) => {
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
});
