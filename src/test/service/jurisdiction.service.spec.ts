import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("jurisdictionService", () => {

  const jurisdictionUrl = "http://localhost:9999/jurisdiction";

  let req;
  let fetchAll;

  beforeEach(() => {
    req = {
      file: {
        buffer: new Buffer(8),
      },
      headers: {
        Authorization: "userAuthToken",
        ServiceAuthorization: "serviceAuthToken",
      },
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.jurisdiction_url").returns(jurisdictionUrl);

    fetchAll = proxyquire("../../main/service/jurisdiction.service.ts", {
      config,
    }).fetchAll;
  });

  describe("successful jurisdiction lookup", () => {
    it("should return an HTTP 201 status and success message", (done) => {
      const expectedResult =  { jurisdictions:[ { id: 'JD_1', name: 'Jurisdiction 1' },{ id: 'JD_2', name: 'Jurisdiction 2' } ] };

      nock("http://localhost:9999")
        .get("/jurisdiction")
        .reply(201, expectedResult);

      fetchAll(req).then((res) => {
       
        try {
          expect(res).to.equal(JSON.stringify(expectedResult));
          
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe("invalid S2S token", () => {
      it("should return an HTTP 403 status and error message", (done) => {
        req.headers.ServiceAuthorization = "invalid_token";

        const expectedResult = {
          error: "Forbidden",
          message: "Access Denied",
        };

        nock("http://localhost:9999")
          .get("/jurisdiction")
          .reply(403, expectedResult);

        fetchAll(req).catch((err) => {
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
