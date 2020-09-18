import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("elasticIndexService", () => {

  const elasticUrl = "http://localhost:9999/elastic-support/index";

  let req;
  let createElasticIndices;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.elastic_index_url").returns(elasticUrl);

    createElasticIndices = proxyquire("../../main/service/elastic-index-service", {
      config,
    }).createElasticIndices;
  });

  describe("successful elasticsearch index", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = "Elasticsearch indices created successfully";

      nock("http://localhost:9999")
        .post("/elastic-support/index")
        .reply(201, expectedResult);

      createElasticIndices(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          done();
        } catch (e) {
          done(e);
        }
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
          .post("/elastic-support/index")
          .reply(403, expectedResult);

        createElasticIndices(req).catch((err) => {
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
});
