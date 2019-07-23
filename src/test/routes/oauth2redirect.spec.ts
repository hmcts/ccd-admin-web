import { app } from "../../main/app";
import * as cookie from "cookie";
import * as chai from "chai";
import { COOKIE_ACCESS_TOKEN } from "../../main/routes/oauth2redirect";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as request from "supertest";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as sinonExpressMock from "sinon-express-mock";

chai.use(sinonChai);

describe("oauth2redirect", () => {

  const token = "ey123.ey456";

  describe("when OAuth2 code is present", () => {
    it("should set an accessToken cookie and redirect to /", () => {
      idamServiceMock.resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect?code=abc123")
        .then((res) => {
          const cookies = res.get("Set-Cookie").map((_) => cookie.parse(_));
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.true;
          expect(res.headers.location).to.equal("/");
        });
    });
  });

  describe("when OAuth2 code is not present", () => {
    it("should not set an accessToken cookie", () => {
      idamServiceMock.resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect")
        .then((res) => {
          const cookies = res.get("Set-Cookie").map((_) => cookie.parse(_));
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.false;
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

      req = sinonExpressMock.mockReq();
      req.query = {code: "code", redirect_uri: "https://localhost:5000"};
      res = sinonExpressMock.mockRes();
      next = sinon.stub();
      accessTokenRequest = sinon.stub();
      accessTokenRequest.withArgs(req).returns(Promise.resolve(TOKEN));

      oauth2redirect = proxyquire("../../main/routes/oauth2redirect", {
        "../oauth2/access-token-request": accessTokenRequest,
        "config": config,
      }).oauth2redirect;
    });

    it("should set an accessToken cookie with the 'secure' flag enabled", (done) => {
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
