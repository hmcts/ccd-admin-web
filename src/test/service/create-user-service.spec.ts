import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";
import { UserProfile } from "../../main/domain/userprofile";

const expect = chai.expect;
chai.use(sinonChai);

describe("test create user profile service", () => {

  const createUserProfileURL = "http://localhost:4453/users/save";

  let createUserProfile;

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: {},
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.saveuserprofiles_url").returns(createUserProfileURL);

    createUserProfile = proxyquire("../../main/service/create-user-service", {
      config,
    }).createUserProfile;
  });

  it("should return an HTTP 201 status and success message", (done) => {
    const expectedResult = "User profile created successfully";

    nock("http://localhost:4453")
      .put("/users/save")
      .reply(201, expectedResult);

    createUserProfile(req, new UserProfile("someid@yahoo.com", "test",
      "jurisdictionname", "caseType", "state")).then((res) => {
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
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4453")
      .put("/users/save")
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

describe("test update user profile service", () => {

  const updateUserProfileURL = "http://localhost:4453/users";

  let createUserProfile;

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: { update: true },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns(updateUserProfileURL);

    createUserProfile = proxyquire("../../main/service/create-user-service", {
      config,
    }).createUserProfile;
  });

  it("should return an HTTP 201 status and success message", (done) => {
    const expectedResult = "User profile created successfully";

    nock("http://localhost:4453")
      .put("/users")
      .reply(201, expectedResult);

    createUserProfile(req, new UserProfile("someid@yahoo.com", "test",
      "jurisdictionname", "caseType", "state")).then((res) => {
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
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4453")
      .put("/users")
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

  it("should return an HTTP 503 status service unavailable", (done) => {
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Server Error",
      message: "Service unavailable",
    };

    nock("http://localhost:4453")
      .put("/users")
      .reply(503, expectedResult);

    createUserProfile(req, new UserProfile("someid@yahoo.com", "test", "jurisdictionname", "caseType", "state"))
      .catch((err) => {
        try {
          expect(err.status).to.equal(503);
          expect(err.response.body.error).to.equal(expectedResult.error);
          expect(err.response.body.message).to.equal(expectedResult.message);
          done();
        } catch (e) {
          done(e);
        }
      });
  });
});
