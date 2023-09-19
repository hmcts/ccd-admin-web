import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import { flattenJsonResponse } from "routes/welshDictionary";
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

  describe("Successful flatten recieved Welsh dictionary response", () => {
    it("should return array of strings ", (done) => {
      const dict =
      `{
        "translations": {
            "texta": {
                "translation": "welsha",
                "yesOrNo": true,
                "yes": "yesa",
                "no": "noa"
            },
            "texty": {
                "translation": "welshy",
                "yesOrNo": false
            },
            "textz": {
                "translation": "welshz"
            },
            "text": {
                "translation": ""
            }
        }
      }`;

      const data = JSON.parse(dict).translations;
      const csvContent = flattenJsonResponse(data);
      const flat = csvContent.split("\r\n");

      try {
        expect(flat.length).to.equal(4);
        expect(flat[0]).to.equal("texta,welsha,true,yesa,noa");
        expect(flat[1]).to.equal("texty,welshy");
        expect(flat[2]).to.equal("textz,welshz");
        expect(flat[3]).to.equal("text");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe("Successful handle special characters in recieved Welsh dictionary response", () => {
    it("should return correctly formatted array of strings ", (done) => {
      const dict =
      `{
        "translations": {
      `
      + "\"<details><summary><u>Help with interest rates</u></summary><div class=\\\"panel\\\">\\n\\n You can claim 8% interest on money owed to you. This is the statutory rate. If you know that a different rate applies you can use that. For example, if you have a contract with a specific rate. \\n\\n The court will decide if you're entitled to some, or all, of the interest claimed.</div></details><br />\": {"
      + `
                "translation": "welsha",
                "yesOrNo": true,
                "yes": "yesa",
                "no": "noa"
            },
            "texty": {
                "translation": "welshy",
                "yesOrNo": false
            },
            "textz": {
                "translation": "welshz"
            },
            "text": {
                "translation": ""
            }
        }
      }`;

      const data = JSON.parse(dict).translations;
      const csvContent = flattenJsonResponse(data);
      const flat = csvContent.split("\r\n");

      try {
        expect(flat.length).to.equal(4);
        expect(flat[0]).to.equal(
          "\"<details><summary><u>Help with interest rates</u></summary><div class=\"\"panel\"\">\n\n You can claim 8% interest on money owed to you. This is the statutory rate. If you know that a different rate applies you can use that. For example, if you have a contract with a specific rate. \n\n The court will decide if you're entitled to some, or all, of the interest claimed.</div></details><br />\"" +
          ",welsha,true,yesa,noa");
        expect(flat[1]).to.equal("texty,welshy");
        expect(flat[2]).to.equal("textz,welshz");
        expect(flat[3]).to.equal("text");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});
