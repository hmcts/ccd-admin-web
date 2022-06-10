import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("test manage Welsh Dictionary Service", () => {

  const manageDictionaryUrl = "http://localhost:9999/dictionary";

  let req;
  let manageDictionary;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      file: {
        buffer: new Buffer(8),
        originalname: "dummy_filename.csv",
      },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.welsh_translation_get_dictionary_url").returns(manageDictionaryUrl);

    manageDictionary = proxyquire("../../main/service/manage-welsh-dictionary-service", {
      config,
    }).uploadTranslations;
  });

  describe("Successful put Welsh Translations", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = "Uploaded the latest Welsh Translations successfully";

      nock("http://localhost:9999")
        .put("/dictionary")
        .reply(201, expectedResult);

      manageDictionary(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          // expect(res.file.originalname).to.equal("dummy_filename.csv");
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
        .put("/dictionary")
        .reply(403, expectedResult);

      manageDictionary(req).catch((err) => {
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
