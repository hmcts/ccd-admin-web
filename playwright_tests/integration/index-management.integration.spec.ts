import { expect, test } from "../e2e/fixtures";
import {
  mockElasticsearchCaseTypesFailure,
  mockElasticsearchIndexing,
  mockElasticsearchIndexingFailure,
  mockGlobalSearchIndexingFailure,
  mockGlobalSearchIndexingSuccess,
} from "./mocks/index-management.mocks";
import { IndexManagementPage } from "./page-objects/index-management.po";
import { ERROR_TEXT_COLOUR } from "../support/assertionData";

test.describe("mocked index-management UI states", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("shows progress for each mocked Elasticsearch index request", async ({ page }) => {
    const indexManagementPage = new IndexManagementPage(page);
    const requestedCaseTypes = await mockElasticsearchIndexing(page, ["MockCaseTypeOne", "MockCaseTypeTwo"]);

    await indexManagementPage.openElasticsearch();
    await expect(indexManagementPage.heading).toHaveText("Create Elasticsearch Indices");
    await expect(indexManagementPage.submitButton).toBeVisible();

    await indexManagementPage.submit();

    await expect(indexManagementPage.results).toContainText("[STARTING] Creating indexes for 2 case types");
    await expect(indexManagementPage.results).toContainText(
      "[001] Created index for case type 'MockCaseTypeOne', jurisdiction 'MockJurisdiction'",
    );
    await expect(indexManagementPage.results).toContainText(
      "[002] Created index for case type 'MockCaseTypeTwo', jurisdiction 'MockJurisdiction'",
    );
    await expect(indexManagementPage.results).toContainText("[FINISHED] Processing complete");
    await expect(indexManagementPage.submitButton).toBeHidden();
    expect(requestedCaseTypes).toEqual(["MockCaseTypeOne", "MockCaseTypeTwo"]);
  });

  test("renders a mocked Global Search API failure as a red error", async ({ page }) => {
    const indexManagementPage = new IndexManagementPage(page);
    await mockGlobalSearchIndexingFailure(page, "Mock global search failure");

    await indexManagementPage.openGlobalSearch();
    await expect(indexManagementPage.heading).toHaveText("Create Global Search Indices");

    await indexManagementPage.submit();

    await expect(indexManagementPage.results).toContainText("[STARTING] Creating Global Search Indices");
    const errorMessage = indexManagementPage.results.getByText("Error occurred : Mock global search failure");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveCSS("color", ERROR_TEXT_COLOUR);
  });

  test("renders a case-type lookup failure and allows the request to be retried", async ({ page }) => {
    const indexManagementPage = new IndexManagementPage(page);
    await mockElasticsearchCaseTypesFailure(page, "Mock case-type lookup failure");

    await indexManagementPage.openElasticsearch();
    const failedCaseTypesResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === "/elasticsearch/case-types" && response.status() === 500;
    });

    await indexManagementPage.submit();
    await failedCaseTypesResponse;

    await expect(indexManagementPage.errorMessages).toHaveText(
      "Error occurred getting case types : Mock case-type lookup failure",
    );
    await expect(indexManagementPage.errorMessages).toHaveCSS("color", ERROR_TEXT_COLOUR);
    await expect(indexManagementPage.submitButton).toBeVisible();
  });

  test("continues Elasticsearch processing after one mocked case type fails", async ({ page }) => {
    const indexManagementPage = new IndexManagementPage(page);
    const requestedCaseTypes = await mockElasticsearchIndexingFailure(
      page,
      ["FailingCaseType", "SuccessfulCaseType"],
      "FailingCaseType",
      "Mock indexing failure",
    );

    await indexManagementPage.openElasticsearch();
    await indexManagementPage.submit();

    const errorMessage = indexManagementPage.results.getByText(
      "[001] Error occurred for case type 'FailingCaseType': Mock indexing failure",
    );
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveCSS("color", ERROR_TEXT_COLOUR);
    await expect(indexManagementPage.results).toContainText(
      "[002] Created index for case type 'SuccessfulCaseType', jurisdiction 'MockJurisdiction'",
    );
    await expect(indexManagementPage.results).toContainText("[FINISHED] Processing complete");
    expect(requestedCaseTypes).toEqual(["FailingCaseType", "SuccessfulCaseType"]);
  });

  test("renders completion after a successful mocked Global Search request", async ({ page }) => {
    const indexManagementPage = new IndexManagementPage(page);
    const requests = await mockGlobalSearchIndexingSuccess(page);

    await indexManagementPage.openGlobalSearch();
    await indexManagementPage.submit();

    await expect(indexManagementPage.results).toContainText("[STARTING] Creating Global Search Indices");
    await expect(indexManagementPage.results).toContainText("[FINISHED] Processing complete");
    expect(requests.count).toBe(1);
  });
});
