import * as chai from "chai";
import * as nock from "nock";
import * as sinonChai from "sinon-chai";
import {fetch} from "../../main/service/get-service";

const expect = chai.expect;
chai.use(sinonChai);

describe("Get service", () => {

  // Can be any GET endpoint; using the Definitions one
  const definitionStoreHost = "http://localhost:4451";
  const definitionsEndpoint = "/api/drafts";
  const definitionsUrl = definitionStoreHost + definitionsEndpoint;

  let req;
  let query;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      body: {jurisdictionName: "TEST"},
      serviceAuthToken: "serviceAuthToken",
      session: {},
    };

    query = {jurisdiction: req.body.jurisdictionName};
  });

  describe("successful data retrieval", () => {
    it("should return an HTTP 200 status and success message", (done) => {
      const expectedResult = {
        definitions: [
          {
            author: "ccd@hmcts.net",
            data: {
              Field1: "Some value",
            },
            deleted: "false",
            description: "Draft definition 1",
            jurisdiction: {
              description: "Test jurisdiction",
              id: "TEST",
              name: "Test",
            },
            status: "DRAFT",
            version: 1,
          },
          {
            author: "ccdimporter@hmcts.net",
            data: {
              Field1: "Some value",
              Field2: [
                {
                  Name: "Label",
                  Type: "Text",
                },
              ],
            },
            deleted: "false",
            description: "Draft definition 2",
            jurisdiction: {
              description: "Test jurisdiction",
              id: "TEST",
              name: "Test",
            },
            status: "PUBLISHED",
            version: 2,
          },
        ],
      };

      nock(definitionStoreHost)
        .get(definitionsEndpoint)
        .query(query)
        .reply(200, expectedResult);

      fetch(req, definitionsUrl, query).then((res) => {
        try {
          expect(JSON.parse(res).definitions).to.have.lengthOf(2);
          expect(res).to.equal(JSON.stringify(expectedResult));
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should return data when query parameter is empty", (done) => {
      const expectedResult = {
        definitions: [
          {
            author: "ccd@hmcts.net",
            data: {
              Field1: "Some value",
            },
            deleted: "false",
            description: "Draft definition 1",
            jurisdiction: {
              description: "Test jurisdiction",
              id: "TEST",
              name: "Test",
            },
            status: "DRAFT",
            version: 1,
          },
        ],
      };
      req = {
        accessToken: "userAuthToken",
        body: {},
        serviceAuthToken: "serviceAuthToken",
        session: {jurisdiction: "test2"},
      };
      query = {};

      nock(definitionStoreHost)
        .get(definitionsEndpoint)
        .query(query)
        .reply(200, expectedResult);

      fetch(req, definitionsUrl, query).then((res) => {
        try {
          expect(JSON.parse(res).definitions).to.have.lengthOf(1);
          expect(res).to.equal(JSON.stringify(expectedResult));
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

        nock(definitionStoreHost)
          .get(definitionsEndpoint)
          .query(query)
          .reply(403, expectedResult);

        fetch(req, definitionsUrl, query).catch((err) => {
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

    describe("downstream failures", () => {
      it("should preserve an HTTP 500 response", (done) => {
        nock(definitionStoreHost)
          .get(definitionsEndpoint)
          .query(query)
          .reply(500, "Internal Server Error");

        fetch(req, definitionsUrl, query)
          .then(() => done(new Error("Expected the HTTP 500 response to reject")))
          .catch((err) => {
            try {
              expect(err.status).to.equal(500);
              expect(err.response.text).to.equal("Internal Server Error");
              done();
            } catch (e) {
              done(e);
            }
          });
      });

      it("should distinguish a connection reset from an HTTP response", (done) => {
        nock(definitionStoreHost)
          .get(definitionsEndpoint)
          .query(query)
          .replyWithError({code: "ECONNRESET", message: "Connection reset"});

        fetch(req, definitionsUrl, query)
          .then(() => done(new Error("Expected the connection reset to reject")))
          .catch((err) => {
            try {
              expect(err.code).to.equal("ECONNRESET");
              expect(err.response).to.be.undefined;
              expect(err.text).to.equal("Error retrieving data: no error response");
              done();
            } catch (e) {
              done(e);
            }
          });
      });
    });
  });
});
