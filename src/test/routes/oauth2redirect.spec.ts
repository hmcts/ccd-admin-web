import { app } from "../../main/app";
import { expect, use } from "chai";
import { COOKIE_ACCESS_TOKEN } from "../../main/routes/oauth2redirect";
import { resolveExchangeCode } from "../http-mocks/idam";
import request from "supertest";
import proxyquire from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { mockReq, mockRes } from "sinon-express-mock";
import { OAUTH_STATE_TTL_MS } from "../../main/oauth2/oauth-state";

use(sinonChai);

describe("oauth2redirect", () => {

  const token = "ey123.ey456";
  const initialiseOAuthSession = () => {
    const agent = request.agent(app);

    return agent
      .get("/")
      .then((res) => {
        const state = new URL(res.headers.location).searchParams.get("state");

        expect(state).to.be.a("string");

        const cookies = res.get("Set-Cookie").map((cookie) => cookie.split(";")[0]);

        return { agent, state, cookies };
      });
  };

  const parseSetCookie = (setCookieHeader: string): {[key: string]: string} => {
    return setCookieHeader.split(";").reduce((cookies, cookiePart) => {
      const separatorIndex = cookiePart.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const name = cookiePart.substr(0, separatorIndex).trim();
      cookies[name] = decodeURIComponent(cookiePart.substr(separatorIndex + 1).trim());
      return cookies;
    }, {} as {[key: string]: string});
  };

  describe("when OAuth2 code is present", () => {
    it("should set an accessToken cookie and redirect to /", () => {
      return initialiseOAuthSession()
        .then(({ agent, state }) => {
          resolveExchangeCode(token);

          return agent.get(`/oauth2redirect?code=abc123&state=${state}`);
        })
        .then((res) => {
          const cookies = (res.get("Set-Cookie") || []).map(parseSetCookie);
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.true;
          expect(res.headers.location).to.equal("/");
        });
    });
  });

  describe("when OAuth2 code is not present", () => {
    it("should not set an accessToken cookie", () => {
      return initialiseOAuthSession()
        .then(({ agent, state }) => agent.get(`/oauth2redirect?state=${state}`))
        .then((res) => {
          const cookies = (res.get("Set-Cookie") || []).map(parseSetCookie);
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.false;
          expect(res.status).to.equal(500);
          expect(res.text).includes("Error: Unable to obtain access token - no OAuth2 code provided");
        });
    });
  });

  describe("when OAuth2 state is invalid", () => {
    it("should reject the request before exchanging the code", () => {
      return initialiseOAuthSession()
        .then(({ agent }) => agent.get("/oauth2redirect?code=abc123&state=invalid-state"))
        .then((res) => {
          const cookies = (res.get("Set-Cookie") || []).map(parseSetCookie);
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.false;
          expect(res.status).to.equal(400);
        });
    });

    it("should reject missing state", async () => {
      const { agent } = await initialiseOAuthSession();

      await agent.get("/oauth2redirect?code=abc123").expect(400);
    });

    it("should reject repeated state parameters", async () => {
      const { agent, state } = await initialiseOAuthSession();

      await agent.get(`/oauth2redirect?code=abc123&state=${state}&state=${state}`).expect(400);
    });

    it("should reject state from another browser without invalidating the owner's login", async () => {
      const { agent, state } = await initialiseOAuthSession();
      const otherBrowser = await initialiseOAuthSession();

      await otherBrowser.agent.get(`/oauth2redirect?code=abc123&state=${state}`).expect(400);

      resolveExchangeCode(token);
      await agent.get(`/oauth2redirect?code=abc123&state=${state}`).expect(302);
    });

    it("should reject a replay using the original signed cookies", async () => {
      const { agent, state, cookies } = await initialiseOAuthSession();
      resolveExchangeCode(token);

      await agent.get(`/oauth2redirect?code=abc123&state=${state}`).expect(302);
      await request(app).get(`/oauth2redirect?code=abc123&state=${state}`)
        .set("Cookie", cookies).expect(400);
    });

    it("should accept only one concurrent callback with the same signed cookies", async () => {
      const { state, cookies } = await initialiseOAuthSession();
      resolveExchangeCode(token);

      const responses = await Promise.all([1, 2].map(() => request(app)
        .get(`/oauth2redirect?code=abc123&state=${state}`).set("Cookie", cookies)));

      expect(responses.map((response) => response.status).sort()).to.deep.equal([302, 400]);
    });

    it("should reject an expired state using the original signed cookies", async () => {
      const { state, cookies } = await initialiseOAuthSession();
      const now = Date.now();
      const clock = sinon.stub(Date, "now").returns(now + OAUTH_STATE_TTL_MS);

      try {
        await request(app).get(`/oauth2redirect?code=abc123&state=${state}`)
          .set("Cookie", cookies).expect(400);
      } finally {
        clock.restore();
      }
    });

    it("should preserve a pending login after an unrelated mismatched callback", async () => {
      const { agent, state } = await initialiseOAuthSession();

      await agent.get("/oauth2redirect?code=abc123&state=unrelated").expect(400);

      resolveExchangeCode(token);
      await agent.get(`/oauth2redirect?code=abc123&state=${state}`).expect(302);
    });

    it("should consume state even when no authorization code is supplied", async () => {
      const { agent, state, cookies } = await initialiseOAuthSession();

      await agent.get(`/oauth2redirect?state=${state}`).expect(500);
      await request(app).get(`/oauth2redirect?code=abc123&state=${state}`)
        .set("Cookie", cookies).expect(400);
    });
  });

  for (const reverseOrder of [false, true]) {
    it(`should complete parallel logins in ${reverseOrder ? "reverse" : "original"} order`, async () => {
      const { agent, state: first } = await initialiseOAuthSession();
      const response = await agent.get("/").expect(302);
      const second = new URL(response.headers.location).searchParams.get("state");
      expect(second).not.to.equal(first);

      for (const state of reverseOrder ? [second, first] : [first, second]) {
        resolveExchangeCode(token);
        await agent.get(`/oauth2redirect?code=abc123&state=${state}`).expect(302);
      }
    });
  }

  describe("OAuth2 redirect with secure flag", () => {

    const TOKEN = {
      access_token: "ey123.ey456",
      expires_in: 3600,
    };

    let req;
    let res;
    let next;
    let config;
    let accessTokenRequest;
    let oauthState;
    let oauth2redirect;

    beforeEach(() => {
      config = {
        get: sinon.stub(),
      };

      req = mockReq();
      req.query = {code: "code", redirect_uri: "https://localhost:5000", state: "valid-state"};
      res = mockRes();
      next = sinon.stub();
      accessTokenRequest = sinon.stub();
      accessTokenRequest.withArgs(req).returns(Promise.resolve(TOKEN));
      oauthState = {
        consumeOAuthState: sinon.stub().returns(false),
      };
      oauthState.consumeOAuthState.withArgs(req, "valid-state").returns(true);

      oauth2redirect = proxyquire.noCallThru()("../../main/routes/oauth2redirect", {
        "../oauth2/access-token-request": {accessTokenRequest},
        "../oauth2/oauth-state": oauthState,
        "config": config,
      }).oauth2redirect;
    });

    it("should set an accessToken cookie with the 'secure' flag enabled", (done) => {
      config.get.withArgs("security.secure_auth_cookie_enabled").returns(true);

      res.redirect.callsFake(() => {
        try {
          expect(config.get).to.be.calledWith("security.secure_auth_cookie_enabled");
          expect(res.cookie).to.be.calledWith(COOKIE_ACCESS_TOKEN, TOKEN.access_token,
            {httpOnly: true, maxAge: TOKEN.expires_in * 1000, secure: true});
          expect(res.redirect).to.be.calledWith(302, "/");
          done();
        } catch (e) {
          done(e);
        }
      });

      oauth2redirect(req, res, next);
    });

    it("should reject requests with a mismatched state", () => {
      req.query.state = "unexpected-state";

      oauth2redirect(req, res, next);

      expect(oauthState.consumeOAuthState).to.have.been.calledWith(req, "unexpected-state");
      expect(accessTokenRequest).not.to.have.been.called;
      expect(next).to.have.been.called;

      const error = next.firstCall.args[0];
      expect(error.message).to.equal("Invalid OAuth2 state parameter");
      expect(error.status).to.equal(400);
    });

  });

});
