import { expect, test } from "./fixtures";
import { mockWelshDictionaryFailure } from "./mocks/welsh-dictionary.mocks";
import { INLINE_ERROR_TEXT_COLOUR } from "../support/assertionData";

const FAILURE_STATUS_CODES = [400, 401, 500, 503];

test.describe("mocked Welsh dictionary UI states - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  for (const status of FAILURE_STATUS_CODES) {
    test(`renders a dictionary HTTP ${status} response as a red error`, async ({ page, welshDictionaryPage }) => {
      const message = `Mock dictionary failure ${status}`;
      await mockWelshDictionaryFailure(page, message, status);

      await welshDictionaryPage.open();
      await welshDictionaryPage.download();

      const errorMessage = welshDictionaryPage.results.getByText(`Error occurred: ${message}`);
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveCSS("color", INLINE_ERROR_TEXT_COLOUR);
    });
  }
});
