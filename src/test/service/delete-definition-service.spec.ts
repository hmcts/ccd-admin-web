import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as nock from "nock";

const expect = chai.expect;
chai.use(sinonChai);

describe("Test Delete Definition service", () => {

  const deleteDefinitionUrl = "http://localhost:4451/api/draft";

  let deleteDefinition;

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: {
        definitionVersion: 1,
        jurisdictionId: "TEST",
      },
      serviceAuthToken: "serviceAuthToken",
      session: { jurisdiction: "TEST" },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.deletedefinition_url").returns(deleteDefinitionUrl);

    deleteDefinition = proxyquire("../../main/service/delete-definition-service", {
      config,
    }).deleteDefinition;
  });

  xit("should return an HTTP 204 status and success message", (done) => {
    const expectedResult = "Definition deleted successfully";

    nock("http://localhost:4451")
      .delete(`/api/draft/${req.body.jurisdictionId}/${req.body.definitionVersion}`)
      .reply(204, expectedResult);

    deleteDefinition(req).then((res) => {
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

  xit("should return an HTTP 403 status and error message", (done) => {
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4451")
      .delete(`/api/draft/${req.body.jurisdictionId}/${req.body.definitionVersion}`)
      .reply(403, expectedResult);

    deleteDefinition(req).catch((err) => {
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
