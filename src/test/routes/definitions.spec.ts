import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as mockSession from "mock-session";
import * as request from "supertest-session";
import * as sinon from "sinon";

describe("Definitions page", () => {

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.definitions_url").returns("definitions_url");
    mock.cleanAll();
  });

  describe("on GET /definitions", () => {
    it("should return Definitions list for given Jurisdiction", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      // TODO Change endpoint, once adminWeb.definitions_url points to http://localhost:4451/api/drafts
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "TEST" })
        .reply(200, [{
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction_id: 1,
          status: "DRAFT",
        }]);

      // Set jurisdiction in the appTest session object, which is stored as a cookie (signed with "key1", as in appTest)
      const sessionCookie = mockSession("session", "key1", { jurisdiction: "TEST" });

      return request(appTest)
        .get("/definitions")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          // TODO Re-enable when the Definitions List page has been implemented
          // expect(res.text).to.contain("Draft definition");
          // expect(res.text).to.contain("Some value");
        });
    });

    it("should return all Definitions list if Jurisdiction is not present in session", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      // TODO Change endpoint, once adminWeb.definitions_url points to http://localhost:4451/api/drafts
      mock("http://localhost:4453")
        .get("/users")
        .query({})
        .reply(200, [{
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction_id: 1,
          status: "DRAFT",
        }]);

      // Omit jurisdiction in the appTest session object
      const sessionCookie = mockSession("session", "key1", {});

      return request(appTest)
        .get("/definitions")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          // TODO Re-enable when the Definitions List page has been implemented
          // expect(res.text).to.contain("Draft definition");
          // expect(res.text).to.contain("Some value");
        });
    });
  });

  describe("on POST /definitions", () => {
    it("should return Definitions list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      // TODO Change endpoint, once adminWeb.definitions_url points to http://localhost:4451/api/drafts
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "TEST" })
        .reply(200, [{
          data: {
            Field1: "Some value",
          },
          description: "Draft definition",
          jurisdiction_id: 1,
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
          // TODO Re-enable when the Definitions List page has been implemented
          // expect(res.text).to.contain("Draft definition");
          // expect(res.text).to.contain("Some value");
        });
    });
    it("should return error from the server", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      // TODO Change endpoint, once adminWeb.definitions_url points to http://localhost:4451/api/drafts
      mock("http://localhost:4453")
        .get("/users")
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
