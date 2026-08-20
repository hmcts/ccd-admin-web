import { expect, test } from "./fixtures";

test.describe("reindex tasks UI - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("renders the task filter and current task state", async ({ reindexTasksPage }) => {
    await reindexTasksPage.open();

    await expect(reindexTasksPage.heading).toHaveText("Reindexed Tasks");
    await expect(reindexTasksPage.caseTypeSelect).toBeVisible();
    await expect(reindexTasksPage.filterButton).toBeVisible();
    await expect(reindexTasksPage.autoRefreshToggle).toBeVisible();
    await expect(reindexTasksPage.taskTable).toBeVisible();
  });

  test("filters tasks by a selected case type", async ({ page, reindexTasksPage }) => {
    await reindexTasksPage.open();
    const caseType = await reindexTasksPage.selectFirstCaseType();

    await reindexTasksPage.filterButton.click();

    await expect(page).toHaveURL((url) =>
      url.pathname === "/reindex" && url.searchParams.get("caseType") === caseType,
    );
    await expect(reindexTasksPage.caseTypeSelect).toHaveValue(caseType);
    await expect(reindexTasksPage.taskTable).toBeVisible();
  });

  test("persists the auto-refresh preference across page loads", async ({ page, reindexTasksPage }) => {
    await reindexTasksPage.open();
    await page.evaluate(() => window.localStorage.removeItem("reindexAutoRefreshEnabled"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(reindexTasksPage.autoRefreshToggle).not.toBeChecked();

    await reindexTasksPage.autoRefreshToggle.check();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem("reindexAutoRefreshEnabled")))
      .toBe("true");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(reindexTasksPage.autoRefreshToggle).toBeChecked();

    await reindexTasksPage.autoRefreshToggle.uncheck();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem("reindexAutoRefreshEnabled")))
      .toBe("false");
  });
});
