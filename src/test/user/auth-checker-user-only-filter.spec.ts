import { expect, use, assert } from "chai";
import proxyquire from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";

use(sinonChai);

describe("authCheckerUserOnlyFilter", () => {

  const user = {
    email: "ccd@example.com",
  };
  const loginUrl = "http://idam.login";
  const clientId = "ccd_admin";
  const scope = "testscope";
  const redirectUri = encodeURIComponent("http://localhost/oauth2redirect");
  const state = "generated-state";
  const completeUrl = `${loginUrl}/o/authorize?response_type=code&client_id=${clientId}`
    + `&redirect_uri=${redirectUri}&scope=${scope}&state=${encodeURIComponent(state)}`;

  let req;
  let res;
  let oauthState;
  let userRequestAuthorizer;
  let filter;

  beforeEach(() => {
    req = {
      get: sinon.stub(),
      protocol: "http",
      session: {},
    };
    req.get.withArgs("host").returns("localhost");
    res = {};

    userRequestAuthorizer = {
      authorize: sinon.stub(),
    };

    oauthState = {
      setOAuthState: sinon.stub().callsFake((request) => {
        request.session.oauthState = state;

        return state;
      }),
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("idam.hmcts_access_url").returns(loginUrl);
    config.get.withArgs("idam.web_public_url").returns(loginUrl);
    config.get.withArgs("idam.oauth2.client_id").returns(clientId);
    config.get.withArgs("idam.oauth2.scope").returns(scope);

    filter = proxyquire("../../main/user/auth-checker-user-only-filter", {
      "../oauth2/oauth-state": oauthState,
      "./user-request-authorizer": userRequestAuthorizer,
      "config": config,
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
        redirect: (code: number, url: string) => {
          try {
            assert.equal(code, 302);
            assert.equal(url, completeUrl);
            expect(req.session.oauthState).to.equal(state);
            expect(oauthState.setOAuthState).to.have.been.calledWith(req);
            done();
          } catch (e) {
            done(e);
          }
        },
      };

      filter(req, res, (err) => {
        expect(err).to.equal(error);
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
