import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import * as mock from "nock";
import * as request from "supertest";
import { ERROR_UNAUTHORIZED_ROLE } from "user/user-request-authorizer";

describe("Global Search Indices page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";
  const GLOBAL_SEARCH_PAGE_ENDPOINT = "/globalsearch";
  const GLOBAL_SEARCH_POST_ENDPOINT = "/elastic-support/global-search/index";

  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on GET /globalsearch", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get(GLOBAL_SEARCH_PAGE_ENDPOINT)
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not return Global Search Indices page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(app)
        .get(GLOBAL_SEARCH_PAGE_ENDPOINT)
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
        });
    });

    it("should not return Global Search Indices page when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      return request(app)
        .get(GLOBAL_SEARCH_PAGE_ENDPOINT)
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
          // The "Manage User Profiles" menu item should still be displayed (as this user is authorised for that)
          const menuItem = dom.window.document.querySelector("div.padding > a").innerHTML;
          expect(menuItem).to.equal("Manage User Profiles");
        });
    });

    it("should return Global Search Indices page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get(GLOBAL_SEARCH_PAGE_ENDPOINT)
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Create Global Search Indices");
        });
    });
  });

  describe("on POST /elastic-support/global-search/index", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get(GLOBAL_SEARCH_POST_ENDPOINT)
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not create index when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      const apiCall = mock("http://localhost:4451")
        .post(GLOBAL_SEARCH_POST_ENDPOINT)
        .reply(201, "Created");

      return request(app)
        .post(GLOBAL_SEARCH_POST_ENDPOINT)
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(apiCall.isDone()).to.be.false;
          expect(res.status).to.equal(403);
          const error = JSON.parse(res.text);
          expect(error.error.error).to.equal(ERROR_UNAUTHORIZED_ROLE.error);
          expect(error.error.message).to.equal(ERROR_UNAUTHORIZED_ROLE.message);
          expect(error.error.status).to.equal(ERROR_UNAUTHORIZED_ROLE.status);
        });
    });

    it("should not create index when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      const apiCall = mock("http://localhost:4451")
        .post(GLOBAL_SEARCH_POST_ENDPOINT)
        .reply(201, ["A"]);

      return request(app)
        .post(GLOBAL_SEARCH_POST_ENDPOINT)
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(apiCall.isDone()).to.be.false;
          expect(res.status).to.equal(403);
          const error = JSON.parse(res.text);
          expect(error.error.error).to.equal(ERROR_UNAUTHORIZED_ROLE.error);
          expect(error.error.message).to.equal(ERROR_UNAUTHORIZED_ROLE.message);
          expect(error.error.status).to.equal(ERROR_UNAUTHORIZED_ROLE.status);
        });
    });

    it("should create index when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post(GLOBAL_SEARCH_POST_ENDPOINT)
        .reply(201, "Created");

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/elasticsearch/index")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(apiCall.isDone()).to.be.true;
        });
    });
  });
});
