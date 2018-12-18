import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { Definition } from "../../main/domain/definition";

const expect = chai.expect;
chai.use(sinonChai);

describe("Create Definition service", () => {

  const createDefinitionUrl = "http://localhost:4451/api/draft";

  let createDefinition;
  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: {},
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.createdefinition_url").returns(createDefinitionUrl);

    createDefinition = proxyquire("../../main/service/create-definition-service", {
      config,
    }).createDefinition;
  });

  it("should return an HTTP 201 status and success message", (done) => {
    const expectedResult = "Definition created successfully";

    nock("http://localhost:4451")
      .post("/api/draft")
      .reply(201, expectedResult);

    createDefinition(req, new Definition("TEST", "Draft definition", "\"Field 1\": \"Some value\"", "ccd@hmcts.net"))
      .then((res) => {
        try {
          expect(res.status).to.equal(201);
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
    req.serviceAuthToken = "invalid_token";

    const expectedResult = {
      error: "Forbidden",
      message: "Access Denied",
    };

    nock("http://localhost:4451")
      .post("/api/draft")
      .reply(403, expectedResult);

    createDefinition(req, new Definition("TEST", "Draft definition", "\"Field 1\": \"Some value\"", "ccd@hmcts.net"))
      .catch((err) => {
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
