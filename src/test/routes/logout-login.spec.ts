import { expect } from "chai";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import express from "express";
import proxyquire from "proxyquire";
import sinon from "sinon";
import request from "supertest";

// Exercise the application handlers together with real signed session cookies.
// IdAM can retain its browser SSO cookie after the server-side logout request.
describe("login after logout", () => {
  let browser;
  let exchangeCode;

  beforeEach(async () => {
    const config = { get: sinon.stub() };
    config.get.withArgs("idam.web_public_url").returns("https://idam.example.test");
    config.get.withArgs("idam.oauth2.client_id").returns("ccd_admin");
    config.get.withArgs("idam.oauth2.scope").returns("openid profile roles");
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns("test-secret");
    config.get.withArgs("security.secure_auth_cookie_enabled").returns(false);

    const logout = proxyquire.noCallThru()("../../main/routes/logout", {
      "config": config,
      "../util/fetch": { fetch: sinon.stub().resolves({ status: 204 }) },
    }).logout;
    const authenticate = proxyquire.noCallThru()("../../main/user/auth-checker-user-only-filter", {
      "config": config,
      "@hmcts/nodejs-logging": { Logger: { getLogger: () => ({ warn: () => {} }) } },
      "./user-request-authorizer": {
        authorize: async (req) => {
          if (req.cookies.accessToken) {
            return { email: "admin@example.test" };
          }
          throw { status: 401 };
        },
      },
    }).authCheckerUserOnlyFilter;
    exchangeCode = sinon.stub().resolves({
      access_token: "new-access-token", id_token: "new-id-token", expires_in: 3600,
    });
    const callback = proxyquire.noCallThru()("../../main/routes/oauth2redirect", {
      "config": config,
      "../oauth2/access-token-request": { accessTokenRequest: exchangeCode },
    }).oauth2redirect;

    const app = express();
    app.use(cookieSession({ name: "session", keys: ["test-session-signing-key"] }));
    app.use(cookieParser());
    app.get("/test-login", (req, res) => {
      req.session = { adminWebAuthorization: { canImport: true } };
      res.cookie("accessToken", "old-access-token");
      res.cookie("idToken", "old-id-token");
      res.sendStatus(200);
    });
    app.get("/test-expire-auth", (_req, res) => {
      res.clearCookie("accessToken");
      res.clearCookie("idToken");
      res.sendStatus(200);
    });
    app.get("/logout", logout);
    app.get("/oauth2redirect", callback);
    app.get("/", authenticate, (req, res) => res.json(req.session));
    app.use((_error, _req, res, _next) => res.sendStatus(502));
    browser = request.agent(app);
    await browser.get("/test-login").expect(200);
  });

  it("should require credentials after logout and stop forcing login after a successful callback", async () => {
    await browser.get("/logout").expect(302).expect("Location", "/");
    const redirect = await browser.get("/").expect(302);
    const loginUrl = new URL(redirect.headers.location);
    expect(loginUrl.searchParams.get("prompt")).to.equal("login");
    const state = loginUrl.searchParams.get("state");
    expect(state).to.match(/^[a-f0-9]{64}$/);

    await browser.get("/oauth2redirect").query({ code: "new-code", state })
      .expect(302).expect("Location", "/");
    const landing = await browser.get("/").expect(200);
    expect(landing.body).to.deep.equal({});
    expect(exchangeCode.calledOnce).to.equal(true);

    await browser.get("/test-expire-auth").expect(200);
    const expired = await browser.get("/").expect(302);
    expect(new URL(expired.headers.location).searchParams.has("prompt")).to.equal(false);
  });

  it("should keep requiring credentials if the new login fails", async () => {
    exchangeCode.rejects(new Error("Token exchange failed"));
    await browser.get("/logout").expect(302);
    const redirect = await browser.get("/").expect(302);
    const state = new URL(redirect.headers.location).searchParams.get("state");

    await browser.get("/oauth2redirect").query({ code: "failed-code", state }).expect(502);

    const retry = await browser.get("/").expect(302);
    expect(new URL(retry.headers.location).searchParams.get("prompt")).to.equal("login");
  });
});
