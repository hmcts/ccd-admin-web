import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import * as mock from "nock";
import * as request from "supertest";

describe("Import Definition page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on GET /import", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/import")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not return Import Case Definition page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).not.to.contain("<th>Date Imported</th>");
          expect(res.text).not.to.contain("<th>Who Imported</th>");
          expect(res.text).not.to.contain("<th>Case Type</th>");
          expect(res.text).not.to.contain("<th>Filename</th>");
          expect(res.text).not.to.contain("next century");
          expect(res.text).not.to.contain("ID_3");
          expect(res.text).not.to.contain("I am si of it");
          expect(res.text).not.to.contain("9343EWFMVl");
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
        });
    });

    it("should not return Import Case Definition page when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).not.to.contain("<th>Date Imported</th>");
          expect(res.text).not.to.contain("<th>Who Imported</th>");
          expect(res.text).not.to.contain("<th>Case Type</th>");
          expect(res.text).not.to.contain("<th>Filename</th>");
          expect(res.text).not.to.contain("next century");
          expect(res.text).not.to.contain("ID_3");
          expect(res.text).not.to.contain("I am si of it");
          expect(res.text).not.to.contain("9343EWFMVl");
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
          // The "Manage User Profiles" menu item should still be displayed (as this user is authorised for that)
          const menuItem = dom.window.document.querySelector("div.padding > a").innerHTML;
          expect(menuItem).to.equal("Manage User Profiles");
        });
    });

    it("should not return a back-end error status as it is not called", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .replyWithError(500);

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
        });
    });

    it("should return Import Case Definition page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("<th>Date Imported</th>");
          expect(res.text).to.contain("<th>Who Imported</th>");
          expect(res.text).to.contain("<th>Case Type</th>");
          expect(res.text).to.contain("<th>Filename</th>");
          expect(res.text).to.contain("next century");
          expect(res.text).to.contain("ID_3");
          expect(res.text).to.contain("I am si of it");
          expect(res.text).to.contain("9343EWFMVl");
          expect(res.text).not.to.contain("last century");
          expect(res.text).not.to.contain("xID_3");
          expect(res.text).not.to.contain("I am 100% happy with this piece of work");
          expect(res.text).not.to.contain("x343EWFMVl");
        });
    });

    it("should return a back-end error status", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .replyWithError(500);

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(500);
        });
    });
  });

  describe("on POST /import", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .post("/import")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not upload a valid Definition file when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should not upload a valid Definition file when authenticated but without required authorized role", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {canManageUserProfile: true});

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
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

    it("should upload a valid Definition file when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      const importAuditsApiCall = mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(201);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector(".form-group").innerHTML;
          expect(result).to.contain("Definition imported");
          expect(result).not.to.contain("Warnings:");
          // Assert that the Import Audits API is called
          expect(importAuditsApiCall.isDone()).to.be.true;
          // Check that the Import Audits table is visible and showing the expected data
          expect(res.text).to.contain("<th>Date Imported</th>");
          expect(res.text).to.contain("<th>Who Imported</th>");
          expect(res.text).to.contain("<th>Case Type</th>");
          expect(res.text).to.contain("<th>Filename</th>");
          expect(res.text).to.contain("next century");
          expect(res.text).to.contain("ID_3");
          expect(res.text).to.contain("I am si of it");
          expect(res.text).to.contain("9343EWFMVl");
          expect(res.text).not.to.contain("last century");
          expect(res.text).not.to.contain("xID_3");
          expect(res.text).not.to.contain("I am 100% happy with this piece of work");
          expect(res.text).not.to.contain("x343EWFMVl");
        });
    });

    it("should redirect to Import Definition page without calling back-end if the file is not an Excel file", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.txt",
      };

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should redirect to Import Definition page without calling back-end if no file is present on request", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should redirect to Import Definition page if there is a back-end error", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .replyWithError(500, "Error on Definition import");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is called
          expect(apiCall.isDone()).to.be.true;
        });
    });

    it("should upload a valid Definition file and display any warnings from the import process", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported", {
          "definition-import-warnings": "First warning,Second warning",
        });

      const importAuditsApiCall = mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(201);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector(".form-group").innerHTML;
          expect(result).to.contain("Definition imported");
          expect(result).to.contain("Warnings:");
          expect(result).to.contain("First warning");
          expect(result).to.contain("Second warning");
          // Assert that the Import Audits API is called
          expect(importAuditsApiCall.isDone()).to.be.true;
        });
    });

    it("should display an error page if there is an error not handled elsewhere", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(403, "Forbidden");

      const apiCall = mock("http://localhost:4451")
        .post("/import")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
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
