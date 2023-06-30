import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import {buildTranslationsJson, getRowDataArrayFromCsv} from "../../main/service/manage-welsh-dictionary-service";
const { PassThrough } = require("stream");
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
          expect(req.file.originalname).to.equal("dummy_filename.csv");
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

  describe("test stream", () => {
    it("should get empty JSON message from stream", (done) => {
      const mockedStream = new PassThrough();
      const data = getRowDataArrayFromCsv(mockedStream);
      const translations = buildTranslationsJson(data);
      expect(translations.length).eq(0);
      done();
    });
  });

  describe("test empty data", () => {
    it("should get empty JSON message from data", (done) => {
      const jsonString = buildTranslationsJson(Promise.resolve([]));
      expect(jsonString.length).eq(0);
      done();
    });
  });

  describe("test unexpected data", () => {
    it("should get empty JSON message from unexpected data", (done) => {
      const jsonString = buildTranslationsJson(Promise.resolve([{2: "phrase 1", 3: "trans phase 1"}]));
      expect(jsonString.length).eq(0);
      done();
    });
  });

  describe("test three rows of  data", () => {
    it("should get good JSON message from data", (done) => {

      Promise.resolve([{0: "phrase 1", 1: "trans phase 1"},
                             {0: "phrase 2", 1: "trans phase 2"},
                             {0: "phrase 3", 1: "trans phase 3"}])
          .then((result) => {
            const jsonString = buildTranslationsJson(result);
            expect(jsonString.length).eq(128);
            done();
          })
          .catch(() => {
            throw new Error("Promise should have been resolved");
          });
    });
  });

  describe("test three rows of data with yesOrNo", () => {
    it("should get good JSON message from data", (done) => {

      Promise.resolve([
            {0: "phrase 1", 1: "trans phase 1", 2: true, 3: "yes translation", 4: "no translation"},
            {0: "phrase 2", 1: "trans phase 2", 2: false, 3: "invalid", 4: "invalid"},
            {0: "phrase 3", 1: "trans phase 3", 2: "true", 3: "yes translation", 4: "no translation"}
        ]).then((result) => {
            const jsonString = buildTranslationsJson(result);
            expect(jsonString.length).eq(250);
            expect(jsonString.includes("invalid")).eq(false);
            done();
          })
          .catch(() => {
            throw new Error("Promise should have been resolved");
          });
    });
  });

});
