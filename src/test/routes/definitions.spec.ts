import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
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
    it("should not return Definitions list for given Jurisdiction when not authorized", () => {
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
          expect(res.text).not.to.contain("Type1,Type2");
          expect(res.text).not.to.contain("Draft definition");
          expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
        });
    });

    it("should return Definitions list for given Jurisdiction when authorized", () => {
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

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/definitions")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Type1,Type2");
          expect(res.text).to.contain("Draft definition");
        });
    });

    it("should not return all Definitions list if Jurisdiction is not present in session when not authorized", () => {
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
          expect(res.text).not.to.contain("Type1,Type2");
          expect(res.text).not.to.contain("Draft definition");
          expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
        });
    });

    it("should return all Definitions list if Jurisdiction is not present in session when authorized", () => {
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

      return request(appTestWithAuthorizedAdminWebRoles)
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
    it("should not return Definitions list when not authorized", () => {
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
          expect(res.text).not.to.contain("Type1,Type2");
          expect(res.text).not.to.contain("Draft definition");
        });
    });

    it("should return Definitions list when authorized", () => {
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

      return request(appTestWithAuthorizedAdminWebRoles)
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
    it("should not return error from the server when not authorized", () => {
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
          expect(res.status).to.equal(200);
        });
    });

    it("should return error from the server when authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/drafts")
        .query({ jurisdiction: "TEST" })
        .replyWithError({ code: 500, text: "Server Error" });

      return request(appTestWithAuthorizedAdminWebRoles)
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
