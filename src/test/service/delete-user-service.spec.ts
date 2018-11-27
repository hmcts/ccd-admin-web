import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";

const expect = chai.expect;
chai.use(sinonChai);

describe("test delete user profile service", () => {

  const deleteUserProfileURL = "http://localhost:4453/users";

  let deleteUserProfile;

  let req;

  beforeEach(() => {
    req = {
      body: { idamId: "aaa@yahii.com" },
      headers: {
        Authorization: "userAuthToken",
        ServiceAuthorization: "serviceAuthToken",
      },
      session: { jurisdiction: "test" },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns(deleteUserProfileURL);

    deleteUserProfile = proxyquire("../../main/service/delete-user-service", {
      config,
    }).deleteUserProfile;
  });

  it("should return an HTTP 204 status and success message", (done) => {
    const expectedResult = "User profile deleted successfully";

    nock("http://localhost:4453")
      .delete("/users")
      .query({ uid: "aaa@yahii.com", jid: "test" })
      .reply(204, expectedResult);

    deleteUserProfile(req).then((res) => {
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

  it("should return an HTTP 403 status and error message", (done) => {
    req.headers.ServiceAuthorization = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4453")
      .delete("/users")
      .query({ uid: "aaa@yahii.com", jid: "test" })
      .reply(403, expectedResult);

    deleteUserProfile(req).catch((err) => {
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
