import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";

const expect = chai.expect;
chai.use(sinonChai);

// Based on "delete-user-service.spec.ts".   **** Converted from USER to ROLE ****

describe("test delete role service", () => {

  const deleteRoleURL = "http://localhost:4451/api/user-role";

  let deleteRole;

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: { role: "test-role" },
      serviceAuthToken: "serviceAuthToken",
      session: { jurisdiction: "test" },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userrole_url").returns(deleteRoleURL);

    deleteRole = proxyquire("../../main/service/delete-role-service", {
      config,
    }).deleteRole;
  });

  it("TEST ONE - should return an HTTP 204 status and success message", (done) => {
    const expectedResult = "User role deleted successfully";

    nock("http://localhost:4451")
      .delete("/api/user-role")
      .query({ role: "test-role", jid: "test" })
      .reply(204, expectedResult);

    deleteRole(req).then((res) => {
      try {
        expect(res.status).to.equal(204);
        expect(res.text).to.equal(expectedResult);
        done();
      } catch (e) {
        done(e);
      }
    }).catch((err) => {
      done(err);
    });
  });

  it("TEST TWO - should return an HTTP 403 status and error message", (done) => {
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4451")
      .delete("/api/user-role")
      .query({ role: "test-role", jid: "test" })
      .reply(403, expectedResult);

    deleteRole(req).catch((err) => {
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
