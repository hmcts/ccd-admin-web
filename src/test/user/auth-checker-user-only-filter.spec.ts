import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const assert = chai.assert;
const expect = chai.expect;
chai.use(sinonChai);

describe("authCheckerUserOnlyFilter", () => {

  const user = {
    email: "ccd@example.com",
  };
  const loginUrl = "http://idam.login";
  const clientId = "ccd_admin";
  const redirectUri = encodeURIComponent("http://localhost/oauth2redirect");
  const completeUrl = `${loginUrl}/?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

  let req;
  let res;
  let userRequestAuthorizer;
  let filter;

  beforeEach(() => {
    req = {
      get: sinon.stub(),
      protocol: "http",
    };
    req.get.withArgs("host").returns("localhost");
    res = {};

    userRequestAuthorizer = {
      authorize: sinon.stub(),
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.login_url").returns(loginUrl);
    config.get.withArgs("idam.oauth2.client_id").returns(clientId);

    filter = proxyquire("../../main/user/auth-checker-user-only-filter", {
      "./user-request-authorizer": userRequestAuthorizer,
      config,
    }).authCheckerUserOnlyFilter;
  });

  describe("when user authorised", () => {
    beforeEach(() => {
      userRequestAuthorizer.authorize.returns(Promise.resolve(user));
    });

    it("should call next middleware without error", (done) => {
      filter(req, res, (error) => {
        try {
          expect(error).to.be.undefined;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should set authenticated user in request", (done) => {
      filter(req, res, () => {
        try {
          expect(req.authentication.user).to.equal(user);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("when authorisation failed (401)", () => {
    let error;

    beforeEach(() => {
      error = {
        status: 401,
      };

      userRequestAuthorizer.authorize.returns(Promise.reject(error));
    });

    it("should redirect to the IdAM login URL", (done) => {
      res = {
        redirect: (code, url) => {
          assert.equal(code, 302);
          assert.equal(url, completeUrl);
          done();
        },
      };

      filter(req, res, (err) => {
        try {
          expect(err).to.equal(error);
          expect(res.redirect).to.be.calledWith(302, completeUrl);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("when authorisation is forbidden (403)", () => {
    let error;

    beforeEach(() => {
      error = {
        status: 403,
      };

      userRequestAuthorizer.authorize.returns(Promise.reject(error));
    });

    it("should call the error-handling middleware to render an error page", (done) => {
      res = {
        render: (url) => {
          assert.equal(url, "error");
          done();
        },
      };

      const next = () => { res.render("error"); };

      filter(req, res, next, (err) => {
        try {
          expect(err).to.equal(error);
          expect(next).to.be.calledWith(error);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
