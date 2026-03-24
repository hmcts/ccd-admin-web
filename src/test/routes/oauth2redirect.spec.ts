import { app } from "../../main/app";
import { parse } from "cookie";
import { expect, use } from "chai";
import { COOKIE_ACCESS_TOKEN } from "../../main/routes/oauth2redirect";
import { resolveExchangeCode } from "../http-mocks/idam";
import request from "supertest";
import proxyquire from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { mockReq, mockRes } from "sinon-express-mock";

use(sinonChai);

describe("oauth2redirect", () => {

  const token = "ey123.ey456";

  describe("when OAuth2 code is present", () => {
    it("should set an accessToken cookie and redirect to /", () => {
      resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect?code=abc123")
        .then((res: any) => {
          const cookies = res.get("Set-Cookie").map((_) => parse(_));
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.true;
          expect(res.headers.location).to.equal("/");
        });
    });
  });

  describe("when OAuth2 code is not present", () => {
    it("should not set an accessToken cookie", () => {
      resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect")
        .then((res: any) => {
          const cookies = res.get("Set-Cookie");
          expect(cookies).to.be.undefined;
          expect(res.status).to.equal(500);
          expect(res.text).includes("Error: Unable to obtain access token - no OAuth2 code provided");
        });
    });
  });

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
    let oauth2redirect;

    beforeEach(() => {
      config = {
        get: sinon.stub(),
      };

      req = mockReq();
      req.query = {code: "code", redirect_uri: "https://localhost:5000"};
      res = mockRes();
      next = sinon.stub();
      accessTokenRequest = sinon.stub();
      accessTokenRequest.withArgs(req).returns(Promise.resolve(TOKEN));

      oauth2redirect = proxyquire("../../main/routes/oauth2redirect", {
        "../oauth2/access-token-request": accessTokenRequest,
        "config": config,
      }).oauth2redirect;
    });

    it.skip("should set an accessToken cookie with the 'secure' flag enabled", (done) => {
      config.get.withArgs("security.secure_auth_cookie_enabled").returns(true);

      res.redirect.callsFake(() => {
        try {
          expect(config.get).to.be.calledWith("security.secure_auth_cookie_enabled");
          expect(res.cookie).to.be.calledWith(COOKIE_ACCESS_TOKEN, TOKEN.access_token,
            {httpOnly: true, maxAge: 28800000, secure: true});
          expect(res.redirect).to.be.calledWith(302, "/");
          done();
        } catch (e) {
          done(e);
        }
      });

      oauth2redirect(req, res, next);
    });

  });

});
