import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";
import { UserRole } from "domain/userrole";

const expect = chai.expect;
chai.use(sinonChai);

describe("test create user role service", () => {

  const createUserRoleURL = "http://localhost:4453/api/user-role";

  let createUserRole;

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
    config.get.withArgs("adminWeb.userrole_url").returns(createUserRoleURL);

    createUserRole = proxyquire("../../main/service/create-user-role.ts", {
      config,
    }).createUserRole;
  });

  it("should return an HTTP 201 status and success message", (done) => {
    const expectedResult = "User profile created successfully";

    nock("http://localhost:4453")
      .post("/api/user-role")
      .reply(201, expectedResult);

    createUserRole(req, new UserRole("ccd-admin", "PUBLIC")).then((res) => {
      try {
        expect(res.status).to.equal(201);
        expect(res.text).to.equal(expectedResult);
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

    nock("http://localhost:4453")
      .post("/api/user-role")
      .reply(403, expectedResult);

    createUserRole(req, new UserRole("ccd-admin", "PRIVATE"))
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
