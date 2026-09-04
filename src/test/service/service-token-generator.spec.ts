import * as chai from "chai";
import {get} from "config";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

const expect = chai.expect;

describe("service token generator", () => {

  let serviceTokenGenerator;
  const s2sUrl = get<string>("idam.s2s_url");

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("idam.service_key").returns("AAAA");
    config.get.withArgs("idam.s2s_url").returns(s2sUrl);
    config.get.withArgs("appInsights.enabled").returns(false);

    serviceTokenGenerator = proxyquire("../../main/service/service-token-generator", {
      config,
    }).serviceTokenGenerator;
  });
  describe("generate()", () => {
    it("should return token", async () => {
      const expectedResult = jwt.sign({exp: moment().unix()}, "secret");
      nock(s2sUrl)
        .post("/lease")
        .reply(200, expectedResult);

      const secret = await serviceTokenGenerator();
      expect(secret).to.equal(expectedResult);
    });

    it("should return same token when called twice", async () => {
      const expectedResult = jwt.sign({exp: moment().add(3, "hours").unix()}, "secret");
      nock(s2sUrl)
        .post("/lease")
        .reply(200, expectedResult);

      const secret1 = await serviceTokenGenerator();
      expect(secret1).to.equal(expectedResult);

      const secret2 = await serviceTokenGenerator();
      expect(secret2).to.equal(expectedResult);
    });
  });
});
