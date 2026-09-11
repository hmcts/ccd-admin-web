import { expect, test } from "../fixtures";

test.describe("authenticated CCD administrator journeys - positive", () => {
  test.beforeEach(async ({ adminWebPage }) => {
    await adminWebPage.goto();
    await expect(adminWebPage.authenticatedMarker).toBeAttached();
  });

  test("an authorised user reaches the Admin Web landing page", async ({ adminWebPage }) => {
    await expect(adminWebPage.page).toHaveTitle("CCD Admin Web");
    await expect(adminWebPage.importDefinitionLink).toBeVisible();
    await expect(adminWebPage.logoutLink).toBeVisible();
  });

  test("initialises GOV.UK Frontend on the landing page", async ({ adminWebPage }) => {
    const page = adminWebPage.page;
    const govukFrontendAsset = await page.request.get("/js/govuk-frontend.min.js");

    await expect(adminWebPage.body).toHaveClass(/js-enabled/);
    await expect(adminWebPage.body).toHaveClass(/govuk-frontend-supported/);
    expect(govukFrontendAsset.ok()).toBe(true);
    expect(await govukFrontendAsset.text()).toContain("initAll");
    await expect(adminWebPage.govukButton).toHaveAttribute(
      "data-govuk-button-init",
      "",
    );
  });

  test("all administration menu items are visible and navigate to their pages", async ({ adminWebPage }) => {
    for (const menuItem of adminWebPage.menuItems) {
      await expect(menuItem.link).toBeVisible();
    }

    for (const menuItem of adminWebPage.menuItems) {
      await adminWebPage.openMenuItem(menuItem);
      await expect(adminWebPage.page).toHaveURL((url) =>
        `${url.pathname}${url.search}` === menuItem.expectedPath,
      );
      await expect(menuItem.pageMarker).toBeVisible();
    }
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
