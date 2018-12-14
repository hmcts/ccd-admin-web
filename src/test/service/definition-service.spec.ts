import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("Definition service", () => {

  const definitionsUrl = "http://localhost:4451/api/drafts";

  let req;
  let fetchDefinitionsByJurisdiction;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      authentication: {
        user : {
          defaultService: "CCD",
          email: "irtahkm@example.com",
          forename: "ccd",
          id: 445,
          roles: [],
          surname: "test",
        },
      },
      body: { jurisdictionName: "TEST" },
      serviceAuthToken: "serviceAuthToken",
      session: {},
    };

    const config = {
      get: sinon.stub(),
    };
    // TODO Change to "adminWeb.definitions_url", once Definition retrieval has been implemented
    config.get.withArgs("adminWeb.userprofiles_url").returns(definitionsUrl);

    fetchDefinitionsByJurisdiction = proxyquire("../../main/service/definition-service", {
      config,
    }).fetchDefinitionsByJurisdiction;
  });

  describe("successful definitions retrieval", () => {
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

      nock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "TEST" })
        .reply(200, expectedResult);

      fetchDefinitionsByJurisdiction(req).then((res) => {
        try {
          expect(JSON.parse(res).definitions.length).to.equal(2);
          expect(res).to.equal(JSON.stringify(expectedResult));
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should return user profiles from query if jurisdictionName is not passed in the body", (done) => {
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
        authentication: {
          user : {
            defaultService: "CCD",
            email: "irtahkm@example.com",
            forename: "ccd",
            id: 445,
            roles: [],
            surname: "test",
          },
        },
        body: {},
        serviceAuthToken: "serviceAuthToken",
        session: { jurisdiction: "test2" },
      };

      nock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "test2" })
        .reply(200, expectedResult);

      fetchDefinitionsByJurisdiction(req).then((res) => {
        try {
          expect(JSON.parse(res).definitions.length).to.equal(1);
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

        nock("http://localhost:4451")
          .get("/api/drafts")
          .query({ jurisdiction: "TEST" })
          .reply(403, expectedResult);

        fetchDefinitionsByJurisdiction(req).catch((err) => {
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
