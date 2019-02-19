import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as mockSession from "mock-session";
import * as request from "supertest-session";
import * as sinon from "sinon";

describe("Definitions page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.definitions_url").returns("definitions_url");
    mock.cleanAll();
  });

  describe("on GET /definitions", () => {
    it("should return Definitions list for given Jurisdiction", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "TEST" })
        .reply(200, [{
          case_types: "Type1,Type2",
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction: {
            description: "Test Jurisdiction",
            id: "TEST",
            name: "Test",
          },
          status: "DRAFT",
        }]);

      // Set jurisdiction in the appTest session object, which is stored as a cookie (signed with "key1", as in appTest)
      const sessionCookie = mockSession("session", "key1", { jurisdiction: "TEST" });

      return request(appTest)
        .get("/definitions")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Type1,Type2");
          expect(res.text).to.contain("Draft definition");
        });
    });

    it("should return all Definitions list if Jurisdiction is not present in session", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/drafts")
        .query({})
        .reply(200, [{
          case_types: "Type1,Type2",
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction: {
            description: "Test Jurisdiction",
            id: "TEST",
            name: "Test",
          },
          status: "DRAFT",
        }]);

      // Omit jurisdiction in the appTest session object
      const sessionCookie = mockSession("session", "key1", {});

      return request(appTest)
        .get("/definitions")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Type1,Type2");
          expect(res.text).to.contain("Draft definition");
        });
    });
  });

  describe("on POST /definitions", () => {
    it("should return Definitions list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "TEST" })
        .reply(200, [{
          case_types: "Type1,Type2",
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction: {
            description: "Test Jurisdiction",
            id: "TEST",
            name: "Test",
          },
          status: "DRAFT",
        }]);

      return request(appTest)
        .post("/definitions")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "TEST",
        })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Type1,Type2");
          expect(res.text).to.contain("Draft definition");
        });
    });
    it("should return error from the server", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "TEST" })
        .replyWithError({ code: 500, text: "Server Error" });

      return request(appTest)
        .post("/definitions")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "TEST",
        })
        .then((res) => {
          expect(res.status).to.equal(500);
        });
    });
  });
});
