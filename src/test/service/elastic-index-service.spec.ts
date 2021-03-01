import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("elasticIndexService::createElasticIndex", () => {

  const indexingUrl = "http://localhost:9999/elastic-support/index";

  let req;
  let createElasticIndex;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      query: {
        ctid: "CaseTypeId",
      },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.elastic_index_url").returns(indexingUrl);

    createElasticIndex = proxyquire("../../main/service/elastic-index-service", {
      config,
    }).createElasticIndex;
  });

  describe("successful elasticsearch index", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = "Elasticsearch indices created successfully";

      nock("http://localhost:9999")
        .post("/elastic-support/index?ctid=CaseTypeId")
        .reply(201, expectedResult);

      createElasticIndex(req).then((res) => {
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
        .post("/elastic-support/index?ctid=CaseTypeId")
        .reply(403, expectedResult);

      createElasticIndex(req).catch((err) => {
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

describe("elasticIndexService::getCaseTypes", () => {

  const caseTypesUrl = "http://localhost:9999/elastic-support/case-types";

  let req;
  let getCaseTypes;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      query: {
        ctid: "CaseTypeId",
      },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.elastic_case_types_url").returns(caseTypesUrl);

    getCaseTypes = proxyquire("../../main/service/elastic-index-service", {
      config,
    }).getCaseTypes;
  });

  describe("successful case types retrieval", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = ["CaseType1", "CaseType2", "CaseType3"];

      nock("http://localhost:9999")
        .get("/elastic-support/case-types")
        .reply(200, expectedResult);

      getCaseTypes(req).then((res) => {
        try {
          expect(res.status).to.equal(200);
          expect(res.body[0]).to.equal(expectedResult[0]);
          expect(res.body[1]).to.equal(expectedResult[1]);
          expect(res.body[2]).to.equal(expectedResult[2]);
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
        .get("/elastic-support/case-types")
        .reply(403, expectedResult);

      getCaseTypes(req).catch((err) => {
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
