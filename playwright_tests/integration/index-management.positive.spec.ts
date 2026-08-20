import { expect, test } from "../e2e/fixtures";
import {
  mockElasticsearchIndexing,
  mockGlobalSearchIndexingSuccess,
} from "./mocks/index-management.mocks";
import { IndexManagementPage } from "./page-objects/index-management.po";

test.describe("mocked index-management UI states - positive", () => {
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
