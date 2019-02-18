import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as userReqAuth from "../../main/user/user-request-authorizer";

const expect = chai.expect;
chai.use(sinonChai);

describe("UserRequestAuthorizer", () => {
  describe("authorize", () => {

    const AUTHZ_HEADER = "Bearer cincwuewncew.cewnuceuncwe.cewucwbeu";
    const USER_ID = 1;
    const ROLE_1 = "role1";
    const DETAILS = {
      id: USER_ID,
      roles: [ROLE_1],
    };
    const COOKIES = {
      [userReqAuth.COOKIE_ACCESS_TOKEN]: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNW91NWFi",
    };

    let request;
    let userResolver;
    let roleAuthorizer;

    let userRequestAuthorizer;

    beforeEach(() => {
      request = {
        cookies: COOKIES,
        get: sinon.stub().returns(AUTHZ_HEADER),
      };
      userResolver = {
        getTokenDetails: sinon.stub().returns(Promise.resolve(DETAILS)),
      };
      roleAuthorizer = {
        isUserAuthorized: sinon.stub().returns(true),
      };

      userRequestAuthorizer = proxyquire("../../main/user/user-request-authorizer", {
      "../role/roles-based-authorizer": roleAuthorizer,
      "./user-resolver": userResolver,
      });
    });

    it("should reject missing Authorization header AND Authorization cookie", (done) => {
      request.get.returns(null);
      request.cookies = null;

      userRequestAuthorizer.authorise(request)
        .then(() => done(new Error("Promise should have been rejected")))
        .catch((error) => {
          expect(error).to.equal(userRequestAuthorizer.ERROR_TOKEN_MISSING);
          done();
        });
    });

    it("should reject when user cannot be resolved", (done) => {
      const ERROR = { error: "oops", status: 401 };
      userResolver.getTokenDetails.returns(Promise.reject(ERROR));

      userRequestAuthorizer.authorise(request)
        .then(() => done(new Error("Promise should have been rejected")))
        .catch((error) => {
          expect(error).to.equal(ERROR);
          done();
        });
    });

    it("should NOT reject missing Authorization header when AccessToken cookie present", (done) => {
      request.get.returns(null);

      userRequestAuthorizer.authorise(request)
        .then(() => done())
        .catch((error) => {
          expect(error).not.to.equal(userRequestAuthorizer.ERROR_TOKEN_MISSING);
          done();
        });
    });

    it("should use the AccessToken cookie when present, to obtain user details", (done) => {
      request.get.returns(null);

      userRequestAuthorizer.authorise(request)
        .then(() => {
          expect(userResolver.getTokenDetails).to.have.been.calledWith(COOKIES[userReqAuth.COOKIE_ACCESS_TOKEN]);
          done();
        })
        .catch(() => done(new Error("Promise should have been resolved")));
    });

    it("should use the AccessToken cookie to set an accessToken property on the request", (done) => {
      request.get.returns(null);

      userRequestAuthorizer.authorise(request)
        .then(() => {
          expect(request.accessToken).to.equal(`Bearer ${COOKIES[userReqAuth.COOKIE_ACCESS_TOKEN]}`);
          done();
        })
        .catch(() => done(new Error("Promise should have been resolved")));
    });

    it("should resolve if the user has an authorized role", () => {
      return Promise.resolve(userRequestAuthorizer.authorise(request))
        .then((result) => {
          expect(roleAuthorizer.isUserAuthorized).to.have.been.calledWith(DETAILS);
          expect(result).to.equal(DETAILS);
        })
        .catch(() => {
          throw new Error("Promise should have been resolved");
        });
    });

    it("should reject if the user has no authorized roles", (done) => {
      roleAuthorizer.isUserAuthorized.returns(false);

      userRequestAuthorizer.authorise(request)
        .then(() => {
          expect(roleAuthorizer.isUserAuthorized).to.have.been.calledWith(DETAILS);
          done(new Error("Promise should have been rejected"));
        })
        .catch((error) => {
          expect(error).to.equal(userRequestAuthorizer.ERROR_UNAUTHORISED_ROLE);
          done();
        });
    });
  });
});
