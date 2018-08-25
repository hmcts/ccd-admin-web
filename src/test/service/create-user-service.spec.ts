import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";
import { UserProfile } from "domain/userprofile";

const expect = chai.expect;
chai.use(sinonChai);

describe("test create user profile service", () => {

  const createUserProfileURL = "http://localhost:4453/user-profile/users";

  let createUserProfile;

  let req;

  beforeEach(() => {
    req = {
      headers: {
        Authorization: "userAuthToken",
        ServiceAuthorization: "serviceAuthToken",
      },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.create_user_profile_url").returns(createUserProfileURL);

    createUserProfile = proxyquire("../../main/service/create-user-service.ts", {
      config,
    }).createUserProfile;
  });

  it("should return an HTTP 201 status and success message", (done) => {
    const expectedResult = "User profile created successfully";

    nock("http://localhost:4453")
      .put("/user-profile/users")
      .reply(201, expectedResult);

    createUserProfile(req, new UserProfile("someid@yahoo.com", "test", "jurisdictionname", "caseType", "state")).then((res) => {
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
      .put("/user-profile/users")
      .reply(403, expectedResult);

    createUserProfile(req, new UserProfile("someid@yahoo.com", "test", "jurisdictionname", "caseType", "state"))
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
