import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("welshDictionaryService::getWelshDictionary", () => {

  const indexingUrl = "http://localhost:9999/dictionary";

  let req;
  let getDictionary;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.welsh_translation_get_dictionary_url").returns(indexingUrl);

    getDictionary = proxyquire("../../main/service/welsh-dictionary-service", {
      config,
    }).getDictionary;
  });

  describe("Successful get Welsh dictionary", () => {
    it("should return an HTTP 200 status and success message", (done) => {
      const expectedResult = "Obtained the latest dictionary successfully";

      nock("http://localhost:9999")
        .get("/dictionary")
        .reply(200, expectedResult);

      getDictionary(req).then((res) => {
        try {
          expect(res.status).to.equal(200);
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
        .get("/dictionary")
        .reply(403, expectedResult);

      getDictionary(req).catch((err) => {
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
