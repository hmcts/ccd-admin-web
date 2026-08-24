import { expect, test } from "../fixtures";

test("an unauthenticated user is redirected to IdAM login", async ({ baseURL, idamPage }) => {
  const applicationUrl = new URL(baseURL as string);

  await idamPage.page.context().clearCookies();
  await idamPage.page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(idamPage.page).toHaveURL((url) =>
    url.origin !== applicationUrl.origin && url.pathname.includes("/login"),
  );

  await expect(idamPage.page).toHaveTitle(/HMCTS|Sign in|Idam Simulator/i);
  await expect(idamPage.usernameInput).toBeVisible();
  await expect(idamPage.passwordInput).toBeVisible();
  await expect(idamPage.submitBtn).toBeVisible();

  const loginUrl = new URL(idamPage.page.url());
  const redirectUrl = new URL(loginUrl.searchParams.get("redirect_uri") as string);

  expect(loginUrl.searchParams.get("response_type")).toBe("code");
  expect(loginUrl.searchParams.get("client_id")).toBeTruthy();
  expect(redirectUrl.origin).toBe(applicationUrl.origin);
  expect(redirectUrl.pathname).toBe("/oauth2redirect");
});
