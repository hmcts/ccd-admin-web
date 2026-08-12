import { expect, test } from "@playwright/test";

test("an unauthenticated user is redirected to IdAM login", async ({ baseURL, page }) => {
  const applicationUrl = new URL(baseURL as string);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL((url) =>
    url.origin !== applicationUrl.origin && url.pathname.includes("/login"),
  );

  const loginUrl = new URL(page.url());
  const redirectUrl = new URL(loginUrl.searchParams.get("redirect_uri") as string);

  expect(loginUrl.searchParams.get("response_type")).toBe("code");
  expect(loginUrl.searchParams.get("client_id")).toBeTruthy();
  expect(redirectUrl.origin).toBe(applicationUrl.origin);
  expect(redirectUrl.pathname).toBe("/oauth2redirect");
});
