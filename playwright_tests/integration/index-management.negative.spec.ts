import { expect, test } from "./fixtures";
import {
  mockElasticsearchCaseTypesFailure,
  mockElasticsearchIndexingFailure,
  mockGlobalSearchIndexingFailure,
} from "./mocks/index-management.mocks";
import { INLINE_ERROR_TEXT_COLOUR } from "../support/assertionData";

const FAILURE_STATUS_CODES = [400, 401, 500, 503];

test.describe("mocked index-management UI states - negative", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  for (const status of FAILURE_STATUS_CODES) {
    test(`renders a Global Search HTTP ${status} response as a red error`, async ({ indexManagementPage, page }) => {
      const message = `Mock global search failure ${status}`;
      await mockGlobalSearchIndexingFailure(page, message, status);

      await indexManagementPage.openGlobalSearch();
      await expect(indexManagementPage.heading).toHaveText("Create Global Search Indices");
      await indexManagementPage.submit();

      await expect(indexManagementPage.results).toContainText("[STARTING] Creating Global Search Indices");
      const errorMessage = indexManagementPage.results.getByText(`Error occurred : ${message}`);
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveCSS("color", INLINE_ERROR_TEXT_COLOUR);
    });

    test(`renders a case-type lookup HTTP ${status} response and allows retry`, async ({ indexManagementPage, page }) => {
      const message = `Mock case-type lookup failure ${status}`;
      await mockElasticsearchCaseTypesFailure(page, message, status);

      await indexManagementPage.openElasticsearch();
      const failedCaseTypesResponse = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === "/elasticsearch/case-types" && response.status() === status;
      });

      await indexManagementPage.submit();
      await failedCaseTypesResponse;

      await expect(indexManagementPage.errorMessages).toHaveText(
        `Error occurred getting case types : ${message}`,
      );
      await expect(indexManagementPage.errorMessages).toHaveCSS("color", INLINE_ERROR_TEXT_COLOUR);
      await expect(indexManagementPage.submitButton).toBeVisible();
    });

    test(`continues Elasticsearch processing after an HTTP ${status} case-type response`, async ({
      indexManagementPage,
      page,
    }) => {
      const message = `Mock indexing failure ${status}`;
      const requestedCaseTypes = await mockElasticsearchIndexingFailure(
        page,
        ["FailingCaseType", "SuccessfulCaseType"],
        "FailingCaseType",
        message,
        status,
      );

      await indexManagementPage.openElasticsearch();
      await indexManagementPage.submit();

      const errorMessage = indexManagementPage.results.getByText(
        `[001] Error occurred for case type 'FailingCaseType': ${message}`,
      );
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveCSS("color", INLINE_ERROR_TEXT_COLOUR);
      await expect(indexManagementPage.results).toContainText(
        "[002] Created index for case type 'SuccessfulCaseType', jurisdiction 'MockJurisdiction'",
      );
      await expect(indexManagementPage.results).toContainText("[FINISHED] Processing complete");
      expect(requestedCaseTypes).toEqual(["FailingCaseType", "SuccessfulCaseType"]);
    });
  }
});
