import { expect, test } from "../fixtures";

test.describe("authenticated CCD administrator journeys - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await test.step("open the Admin Web landing page", async () => {
      await adminWebPage.goto();
      await expect(adminWebPage.authenticatedMarker).toBeAttached();
    });
  });

  test("an authorised user reaches the Admin Web landing page", async ({ adminWebPage }) => {
    await test.step("verify the landing page title", async () => {
      await expect(adminWebPage.page).toHaveTitle("CCD Admin Web");
    });
    await test.step("verify the key landing page links", async () => {
      await expect(adminWebPage.importDefinitionLink).toBeVisible();
      await expect(adminWebPage.logoutLink).toBeVisible();
    });
  });

  test("initialises GOV.UK Frontend on the landing page", async ({ adminWebPage }) => {
    await test.step("verify GOV.UK browser support classes", async () => {
      await expect(adminWebPage.body).toHaveClass(/js-enabled/);
      await expect(adminWebPage.body).toHaveClass(/govuk-frontend-supported/);
    });
    await test.step("verify deployed static assets", async () => {
      expect(await adminWebPage.staticAssetsLoad()).toBe(true);
      expect(await adminWebPage.govukFrontendAssetLoads()).toBe(true);
    });
    await test.step("verify GOV.UK service navigation initialisation", async () => {
      await expect(adminWebPage.govukServiceNavigation).toHaveAttribute(
        "data-govuk-service-navigation-init",
        "",
      );
    });
  });

  test("all administration menu items are visible and navigate to their pages", async ({ adminWebPage }) => {
    await test.step("verify administration menu items are visible", async () => {
      for (const menuItem of adminWebPage.menuItems) {
        await expect(menuItem.link).toBeVisible();
      }
    });

    for (const menuItem of adminWebPage.menuItems) {
      await test.step(`navigate to ${menuItem.expectedPath}`, async () => {
        await adminWebPage.openMenuItem(menuItem);
        await expect(adminWebPage.page).toHaveURL((url) =>
          `${url.pathname}${url.search}` === menuItem.expectedPath,
        );
        await expect(menuItem.pageMarker).toBeVisible();
      });
    }
  });

  test("logout returns the user to IdAM", async ({ adminWebPage, baseURL, idamPage }) => {
    const applicationOrigin = new URL(baseURL as string).origin;

    await test.step("log out of Admin Web", async () => {
      await adminWebPage.logout();
    });
    await test.step("verify redirect to IdAM", async () => {
      await expect(idamPage.page).toHaveURL((url) =>
        url.origin !== applicationOrigin && url.pathname.includes("/enter-email"),
      );
    });
  });
});
