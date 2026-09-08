import { expect } from "chai";
import * as request from "supertest";

describe("deployed application smoke tests", () => {
  const testUrl = process.env.TEST_URL;

  before(() => {
    if (!testUrl) {
      throw new Error("TEST_URL must be set to the deployed CCD Admin Web URL");
    }

    try {
      new URL(testUrl);
    } catch (error) {
      throw new Error(`TEST_URL must be a valid absolute URL: ${testUrl}`);
    }
  });

  ["/health", "/health/liveness", "/health/readiness"].forEach((path) => {
    it(`returns UP from ${path}`, async () => {
      const response = await request(testUrl)
        .get(path)
        .redirects(0);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("UP");
    });
  });

  it("redirects unauthenticated users to IdAM with the expected OAuth parameters", async () => {
    const response = await request(testUrl)
      .get("/")
      .redirects(0);

    expect(response.status).to.equal(302);
    expect(response.headers.location).to.be.a("string");

    const loginUrl = new URL(response.headers.location);
    const redirectUri = loginUrl.searchParams.get("redirect_uri");
    const expectedLoginUrl = process.env.ADMINWEB_LOGIN_URL;

    expect(loginUrl.searchParams.get("response_type")).to.equal("code");
    expect(loginUrl.searchParams.get("client_id")).to.be.a("string").and.not.be.empty;
    expect(redirectUri).to.be.a("string");

    const callbackUrl = new URL(redirectUri);
    const applicationUrl = new URL(testUrl);

    expect(callbackUrl.origin).to.equal(applicationUrl.origin);
    expect(callbackUrl.pathname).to.equal("/oauth2redirect");

    if (expectedLoginUrl) {
      const configuredLoginUrl = new URL(expectedLoginUrl);
      expect(loginUrl.origin).to.equal(configuredLoginUrl.origin);
      expect(loginUrl.pathname).to.equal(configuredLoginUrl.pathname);
    }
  });

  it("returns the expected security headers", async () => {
    const response = await request(testUrl)
      .get("/")
      .redirects(0);

    expect(response.headers["content-security-policy"]).to.be.a("string");
    expect(response.headers["x-content-type-options"]).to.equal("nosniff");
    expect(response.headers["x-frame-options"]).to.equal("SAMEORIGIN");
    expect(response.headers["referrer-policy"]).to.equal("origin");
  });
});
