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
  const requestAttachSpy = sinon.spy(request.Request.prototype, "attach");

  let req;
  let uploadFile;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      file: {
        buffer: new Buffer(8),
        originalname: "dummy_filename.abc",
      },
      serviceAuthToken: "serviceAuthToken",
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.import_url").returns(importUrl);

    uploadFile = proxyquire("../../main/service/import-service", {
      config,
    }).uploadFile;
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
          expect(requestAttachSpy).to.be.calledWith("file", req.file.buffer, { filename: req.file.originalname });
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
