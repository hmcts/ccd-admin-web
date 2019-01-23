import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { Definition } from "../../main/domain/definition";

const expect = chai.expect;
chai.use(sinonChai);

describe("Create Definition service - create Definition", () => {

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
    const expectedResult = {
      author: "ccd@hmcts.net",
      case_types: "Test1,Test2",
      data: {
        "Field 1": "Some value",
      },
      description: "Draft definition",
      version: 1,
    };

    nock("http://localhost:4451")
      .post("/api/draft")
      .reply(201, expectedResult);

    createDefinition(req,
      new Definition("TEST", "Draft definition", "{\"Field 1\": \"Some value\"}", "ccd@hmcts.net", "Test1,Test2"))
      .then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(JSON.stringify(res.body)).to.equal(JSON.stringify(expectedResult));
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

    createDefinition(req, new Definition("TEST", "Draft definition", "{\"Field 1\": \"Some value\"}", "ccd@hmcts.net"))
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

describe("Create Definition service - update Definition", () => {

  const updateDefinitionUrl = "http://localhost:4451/api/draft/save";

  let createDefinition;
  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: { update: true },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.updatedefinition_url").returns(updateDefinitionUrl);

    createDefinition = proxyquire("../../main/service/create-definition-service", {
      config,
    }).createDefinition;
  });

  it("should return an HTTP 200 status and success message", (done) => {
    const expectedResult = {
      author: "ccd@hmcts.net",
      case_types: "Test1,Test2",
      data: {
        "Field 1": "Some value",
      },
      description: "Draft definition",
      status: "DRAFT",
      version: 2,
    };

    nock("http://localhost:4451")
      .put("/api/draft/save")
      .reply(200, expectedResult);

    createDefinition(req,
      new Definition("TEST", "Draft definition", "{\"Field 1\": \"Some value\"}", "ccd@hmcts.net", "Test1,Test2", 1,
        "DRAFT"))
      .then((res) => {
        try {
          expect(res.status).to.equal(200);
          expect(JSON.stringify(res.body)).to.equal(JSON.stringify(expectedResult));
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
      .put("/api/draft/save")
      .reply(403, expectedResult);

    createDefinition(req,
      new Definition("TEST", "Draft definition", "{\"Field 1\": \"Some value\"}", "ccd@hmcts.net", undefined, 1,
        "DRAFT"))
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
