import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";

const expect = chai.expect;
chai.use(sinonChai);

describe("test read user role service", () => {

  const readUserRoleURL = "http://localhost:4451/api/all-roles";

  let fetchAllUserRoles;

  let req;

  beforeEach(() => {
    req = {
      body: {},
      headers: {
        Authorization: "userAuthToken",
        ServiceAuthorization: "serviceAuthToken",
      },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.alluserroles_url").returns(readUserRoleURL);

    fetchAllUserRoles = proxyquire("../../main/service/get-user.roles.service.ts", {
      config,
    }).fetchAllUserRoles;
  });

  it("should return an HTTP 200 status and success message", (done) => {
    const expectedResult = { role: "Admin", security_classification: "PUBLIC" };

    nock("http://localhost:4451")
      .get("/api/all-roles")
      .reply(200, expectedResult);

    fetchAllUserRoles(req).then((res) => {
      try {
        expect(res).to.equal(JSON.stringify(expectedResult));
        done();
      } catch (e) {
        done(e);
      }
    }).catch((err) => {
      done(err);
    });
  });

  it("should return an HTTP 403 status and error message", (done) => {
    req.headers.ServiceAuthorization = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4451")
      .get("/api/all-roles")
      .reply(403, expectedResult);

    fetchAllUserRoles(req)
      .catch((err) => {
        try {
          expect(err.status).to.equal(403);
          expect(err.response.body.error).to.equal(expectedResult.error);
          expect(err.response.body.message).to.equal(expectedResult.message);
          done();
        } catch (e) {
          done(e);
        }
      });
  });
});
