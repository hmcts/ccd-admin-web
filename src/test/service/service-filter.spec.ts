import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("serviceFilter", () => {

  const serviceAuthToken = "ey123.ey456";
  let req;
  let res;
  let tokenGenerator;
  let filter;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};

    tokenGenerator = {
      serviceTokenGenerator: sinon.stub(),
    };

    filter = proxyquire("../../main/service/service-filter", {
      "./service-token-generator": tokenGenerator,
    }).serviceFilter;
  });

  describe("when S2S token obtained", () => {
    beforeEach(() => {
      tokenGenerator.serviceTokenGenerator.returns(Promise.resolve(serviceAuthToken));
    });

    it("should call next middleware without error", (done) => {
      filter(req, res, (error) => {
        try {
          expect(error).to.be.undefined;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should set service auth token in request", (done) => {
      filter(req, res, () => {
        try {
          expect(req.headers.ServiceAuthorization).to.equal(serviceAuthToken);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("when obtaining S2S token failed", () => {
    let error;

    beforeEach(() => {
      error = {
        status: 401,
      };

      tokenGenerator.serviceTokenGenerator.returns(Promise.reject(error));
    });

    it("should call next middleware with an error status", (done) => {
      const next = (err) => {
        try {
          expect(err.status).to.equal(error.status);
          done();
        } catch (e) {
          done(e);
        }
      };

      filter(req, res, next);
    });
  });
});
