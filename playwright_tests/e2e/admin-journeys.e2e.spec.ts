import { expect, test } from "./fixtures";

test.describe("authenticated CCD administrator journeys", () => {
  test.beforeEach(async ({ adminUser, adminWebPage, idamPage }) => {
    test.skip(!adminUser, "Set PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD to run authenticated journeys");

    await adminWebPage.goto();
    await idamPage.login(adminUser!);
    await expect(adminWebPage.heading).toBeVisible();
  });

  test("an authorised user reaches the Admin Web landing page", async ({ adminWebPage }) => {
    await expect(adminWebPage.page).toHaveTitle("CCD Admin Web");
    await expect(adminWebPage.importDefinitionLink).toBeVisible();
    await expect(adminWebPage.logoutButton).toBeVisible();
  });

  test("the import form rejects an empty submission", async ({ adminWebPage, importDefinitionPage }) => {
    await adminWebPage.openImportDefinition();

    await expect(importDefinitionPage.heading).toBeVisible();
    await expect(importDefinitionPage.fileInput).toBeVisible();
    await importDefinitionPage.submitWithoutFile();

    await expect(importDefinitionPage.noFileSelectedError).toBeVisible();
  });

  test("logout returns the user to IdAM", async ({ adminWebPage, baseURL, idamPage }) => {
    const applicationOrigin = new URL(baseURL as string).origin;

    await adminWebPage.logout();

    await expect(idamPage.page).toHaveURL((url) =>
      url.origin !== applicationOrigin && url.pathname.includes("/login"),
    );
    await expect(idamPage.usernameInput).toBeVisible();
    await expect(idamPage.passwordInput).toBeVisible();
    await expect(idamPage.submitBtn).toBeVisible();
  });
});
