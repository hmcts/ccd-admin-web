import { expect, test } from "./fixtures";

test.describe("authenticated CCD administrator journeys", () => {
  test.beforeEach(async ({ adminUser, adminWebPage, idamPage }) => {
    if (!adminUser) {
      throw new Error("PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD are required for authenticated journeys");
    }

    await adminWebPage.goto();
    await idamPage.login(adminUser);

    try {
      await expect(adminWebPage.heading).toBeVisible();
    } catch (error) {
      const idamError = await idamPage.visibleErrorMessage();
      if (idamError) {
        throw new Error(`IdAM login failed: ${idamError}`, { cause: error });
      }
      throw error;
    }
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
