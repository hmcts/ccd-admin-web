import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import * as mock from "nock";
import * as request from "supertest";

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

  describe("on POST /elasticsearch", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .post("/elasticsearch")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not trigger Elasticsearch index when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      const apiCall = mock("http://localhost:4451")
        .post("/elastic-support/index")
        .reply(201, "Elasticsearch indexed");

      return request(app)
        .post("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should not trigger Elasticsearch index when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      const apiCall = mock("http://localhost:4451")
        .post("/elastic-support/index")
        .reply(201, "Elasticsearch indexed");

      return request(app)
        .post("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
          // The "Manage User Profiles" menu item should still be displayed (as this user is authorised for that)
          const menuItem = dom.window.document.querySelector("div.padding > a").innerHTML;
          expect(menuItem).to.equal("Manage User Profiles");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should trigger Elasticsearch index when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post("/elastic-support/index")
        .reply(201, {
          case_types: {
            jur1: ["CT1", "CT2", "CT3"],
            jur2: ["CT4"],
          },
          total: 4,
        });

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(201);
          expect(apiCall.isDone()).to.be.true;
          const dom = new JSDOM(res.text);
          // Check that the summary table is visible
          expect(res.text).to.contain("4 case types have had their index recreated in Elasticsearch");
          expect(res.text).to.contain("<th scope=\"col\">Jurisdiction</th>");
          expect(res.text).to.contain("<th scope=\"col\">Case Types</th>");
          const cells = dom.window.document.querySelectorAll("tbody > tr > td");
          expect(cells[0].innerHTML).to.equal("jur1");
          expect(cells[1].innerHTML).to.equal("CT1, CT2, CT3");
          expect(cells[2].innerHTML).to.equal("jur2");
          expect(cells[3].innerHTML).to.equal("CT4");
        });
    });

    it("should redirect to Index Elasticsearch page if there is a back-end error", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post("/elastic-support/index")
        .replyWithError(500, "Error on Elasticserch index");

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);

          // Assert that the back-end is called
          expect(apiCall.isDone()).to.be.true;
        });
    });

    it("should display an error page if there is an error not handled elsewhere", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(403, "Forbidden");

      const apiCall = mock("http://localhost:4451")
        .post("/elastic-support/index")
        .reply(201, "Elasticsearch indexed");

      return request(app)
        .post("/elasticsearch")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(403);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Error");
          const errorSummary = dom.window.document.querySelector("div.error-summary.govuk-error-message > p").innerHTML;
          expect(errorSummary).to.equal("Forbidden (403)");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });
  });
});
