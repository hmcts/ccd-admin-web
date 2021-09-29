import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("globalSearchIndexService::createGlobalSearchIndex", () => {

  const indexingUrl = "http://localhost:9999/elastic-support/global-search/index";

  let req;
  let createGlobalSearchIndex;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.global_search_index_url").returns(indexingUrl);

    createGlobalSearchIndex = proxyquire("../../main/service/global-search-index-service", {
      config,
    }).createGlobalSearchIndex;
  });

  describe("Successful global search index", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = "Global Search indices created successfully";

      nock("http://localhost:9999")
        .post("/elastic-support/global-search/index")
        .reply(201, expectedResult);

      createGlobalSearchIndex(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("invalid S2S token", () => {
    it("should return an HTTP 403 status and error message", (done) => {
      req.serviceAuthToken = "invalid_token";

      const expectedResult = {
        error: "Forbidden",
        message: "Access Denied",
      };

      nock("http://localhost:9999")
        .post("/elastic-support/global-search/index")
        .reply(403, expectedResult);

      createGlobalSearchIndex(req).catch((err) => {
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

});
