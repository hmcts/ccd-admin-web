import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import * as mock from "nock";
import * as request from "supertest";
import { ERROR_UNAUTHORIZED_ROLE } from "user/user-request-authorizer";

describe("Index Elasticsearch page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on GET /elasticsearch", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/elasticsearch")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not return Index Elasticsearch page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(app)
        .get("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
        });
    });

    it("should not return Index Elasticsearch page when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      return request(app)
        .get("/elasticsearch")
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

    it("should return Index Elasticsearch page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Create Elasticsearch Indices");
          expect(res.text).to.contain("Create Elasticsearch indices for all known case types.");
        });
    });
  });

  describe("on GET /elasticsearch/case-types", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/elasticsearch/case-types")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not get case types when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      const apiCall = mock("http://localhost:4451")
        .get("/elasticsearch/case-types")
        .reply(200, ["A"]);

      return request(app)
        .get("/elasticsearch/case-types")
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

    it("should not get case types when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      const apiCall = mock("http://localhost:4451")
        .get("/elasticsearch/case-types")
        .reply(200, ["A"]);

      return request(app)
        .get("/elasticsearch/case-types")
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

    it("should get case types when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .get("/elastic-support/case-types")
        .reply(200, ["CT1", "CT2", "CT3"]);

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/elasticsearch/case-types")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(apiCall.isDone()).to.be.true;
          expect(res.text).to.equal('["CT1","CT2","CT3"]');
        });
    });
  });

  describe("on POST /elasticsearch/index", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/elasticsearch/index")
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
        .post("/elasticsearch/index")
        .reply(201, "Created");

      return request(app)
        .post("/elasticsearch/index")
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
        .post("/elasticsearch/index")
        .reply(201, ["A"]);

      return request(app)
        .post("/elasticsearch/index")
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
        .post("/elastic-support/index")
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
