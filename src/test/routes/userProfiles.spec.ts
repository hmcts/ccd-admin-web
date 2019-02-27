import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as mockSession from "mock-session";
import * as request from "supertest-session";
import * as sinon from "sinon";

describe("User profiles page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns("userprofiles_url");
    mock.cleanAll();
  });

  describe("on GET /userprofiles", () => {
    it("should return user profiles for given Jurisdiction", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {result: { canManageUserProfile: true }});

      // Set jurisdiction in the appTest session object, which is stored as a cookie (signed with "key1", as in appTest)
      const sessionCookie = mockSession("session", "key1", { jurisdiction: "Mike" });

      return request(appTest)
        .get("/userprofiles")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          // expect(res.text).to.contain("Case Type 3");
          // expect(res.text).to.contain("Jurisdiction 3");
        });
    });

    it("should not show user profiles when user does not have privilege", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      const sessionCookie = mockSession("session", "key1", { jurisdiction: "Mike" });

      return request(appTest)
        .get("/userprofiles")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).not.to.contain("Case Type 3");
          expect(res.text).not.to.contain("Jurisdiction 3");
        });
    });

    it("should return all user profiles if Jurisdiction is not present in session", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453")
      .get("/users")
      .query({})
      .reply(200, [{
        id: "ID_3",
        work_basket_default_case_type: "Case Type 3",
        work_basket_default_jurisdiction: "Jurisdiction 3",
        work_basket_default_state: "State 3",
      }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{canManageUserProfile: true}]);

    // Omit jurisdiction in the appTest session object
    const sessionCookie = mockSession("session", "key1", {});

    return request(appTest)
      .get("/userprofiles")
      .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        // expect(res.text).to.contain("Case Type 3");
        // expect(res.text).to.contain("Jurisdiction 3");
      });
    });

    it("should not return display user profiles when user does not have authorization", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({})
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{canManageUserProfile: true}]);

      // Omit jurisdiction in the appTest session object
      const sessionCookie = mockSession("session", "key1", {});

      return request(appTest)
        .get("/userprofiles")
        .set("Cookie", `accessToken=ey123.ey456;${sessionCookie}`)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).not.to.contain("Case Type 3");
          expect(res.text).not.to.contain("Jurisdiction 3");
        });
    });
  });

  describe("on POST /userprofiles", () => {
    it("should return user profiles list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, { canManageUserProfile: true });

      return request(appTest)
        .post("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          // expect(res.text).to.contain("Case Type 3");
          // expect(res.text).to.contain("Jurisdiction 3");
        });
    });

    it("should not return user profiles list when user does not have authorization", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, { canManageUserProfile: false });

      return request(appTest)
        .post("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).not.to.contain("Case Type 3");
          expect(res.text).not.to.contain("Jurisdiction 3");
        });
    });

    it("should return error from the server", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .replyWithError({ code: 500, text: "Server Error" });

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, { canManageUserProfile: true });

      return request(appTest)
        .post("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.status).to.equal(200);
        });
    });
  });
});
