import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as request from "superagent";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("importService", () => {

  const importUrl = "http://localhost:9999/import";

  let sandbox: sinon.SinonSandbox;
  let requestAttachSpy: sinon.SinonSpy;
  let requestQuerySpy: sinon.SinonSpy;
  let req;
  let uploadFile;
  let isElasticSearchReindexEnabledStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    requestAttachSpy = sandbox.spy(request.Request.prototype, "attach");
    requestQuerySpy = sandbox.spy(request.Request.prototype, "query");

    req = {
      accessToken: "userAuthToken",
      body: {},
      file: {
        buffer: Buffer.from(new Uint8Array(8)),
        originalname: "dummy_filename.abc",
      },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.import_url").returns(importUrl);
    isElasticSearchReindexEnabledStub = sinon.stub().returns(true);

    uploadFile = proxyquire("../../main/service/import-service", {
      "../util/elastic-search-reindex-enabled": {
        isElasticSearchReindexEnabled: isElasticSearchReindexEnabledStub,
      },
      config,
    }).uploadFile;
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  describe("successful file upload", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult = "Case Definition data successfully imported";

      nock("http://localhost:9999")
        .post("/import")
        .reply(201, expectedResult);

      uploadFile(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          expect(requestAttachSpy).to.have.been.calledOnce;
          expect(requestAttachSpy).to.have.been.calledWith(
            "file",
            req.file.buffer,
            { filename: req.file.originalname },
          );
          expect(requestQuerySpy).to.not.have.been.called;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should set reindex query parameter when reindex is true", (done) => {
      const expectedResult = "Case Definition data successfully imported";
      req.body = { reindex: "true" };

      nock("http://localhost:9999")
        .post("/import")
        .query({ reindex: true })
        .reply(201, expectedResult);

      uploadFile(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          expect(requestQuerySpy).to.have.been.calledOnce;
          expect(requestQuerySpy).to.have.been.calledWith({ reindex: true });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should not set query parameters when reindex feature is disabled", (done) => {
      const expectedResult = "Case Definition data successfully imported";
      req.body = { reindex: "true" };
      isElasticSearchReindexEnabledStub.returns(false);

      nock("http://localhost:9999")
        .post("/import")
        .reply(201, expectedResult);

      uploadFile(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          expect(requestQuerySpy).to.not.have.been.called;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should not set query parameters when reindex is false", (done) => {
      const expectedResult = "Case Definition data successfully imported";
      req.body = { reindex: "false" };

      nock("http://localhost:9999")
        .post("/import")
        .reply(201, expectedResult);

      uploadFile(req).then((res) => {
        try {
          expect(res.status).to.equal(201);
          expect(res.text).to.equal(expectedResult);
          expect(requestQuerySpy).to.not.have.been.called;
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
          .post("/import")
          .reply(403, expectedResult);

        uploadFile(req).catch((err) => {
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
