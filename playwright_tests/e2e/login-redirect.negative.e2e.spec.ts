import { expect, test } from "../fixtures";

test("an unauthenticated user is redirected to IdAM login", async ({ baseURL, idamPage }) => {
  const applicationUrl = new URL(baseURL as string);

  let response;
  let loginUrl: URL;
  let redirectUri: URL;

  await test.step("clear the browser session", async () => {
    await idamPage.page.context().clearCookies();
  });

  await test.step("capture the unauthenticated redirect", async () => {
    response = await idamPage.page.request.get("/", { maxRedirects: 0 });
    const location = response.headers().location;

    expect(response.status()).toBe(302);
    expect(location).toBeTruthy();

    loginUrl = new URL(location as string);
    redirectUri = new URL(loginUrl.searchParams.get("redirect_uri") as string);
  });

  await test.step("validate the OAuth redirect parameters", async () => {
    expect(loginUrl.origin).not.toBe(applicationUrl.origin);
    expect(loginUrl.searchParams.get("response_type")).toBe("code");
    expect(loginUrl.searchParams.get("client_id")).toBeTruthy();
    expect(redirectUri.origin).toBe(applicationUrl.origin);
    expect(redirectUri.pathname).toBe("/oauth2redirect");
  });
});
