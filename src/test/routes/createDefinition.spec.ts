import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import { JSDOM } from "jsdom";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

const CCD_IMPORT_ROLE = "ccd-import";

describe("on GET /createdefinition", () => {
  beforeEach(() => {
    mock.cleanAll();
  });
  it("Create Definition should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/createdefinition")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should not respond with form / populated response if authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    return request(app)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Jurisdiction 1");
        expect(res.text).not.to.contain("Jurisdiction 2");
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
      });
  });

  it("should not respond with form / populated response if authenticated but without required authorized role", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {canImportDefinition: true});

    return request(app)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Jurisdiction 1");
        expect(res.text).not.to.contain("Jurisdiction 2");
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
        // The "Import Case Definition" menu item should still be displayed (as this user is authorised for that)
        const menuItem = dom.window.document.querySelector("div.padding > a").innerHTML;
        expect(menuItem).to.equal("Import Case Definition");
      });
  });

  it("should not be calling api when accessing Create Definition form page when not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .replyWithError({ status: 400, rawResponse: "Duplicate values" });

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    return request(app)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(200);
  });

  it("should respond with Create Definition form and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Jurisdiction 1");
        expect(res.text).to.contain("Jurisdiction 2");
      });
  });

  it("should handle error when accessing Create Definition form page", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .replyWithError({ status: 400, rawResponse: "Duplicate values" });

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(400);
  });
});

describe("on POST /createdefinition when unauthorized", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should not be calling api to `create a Definition`", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/draft")
      .post("")
      .reply(201);

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        data: "{\"Field1\": \"data\"}", description: "Draft definition", version: undefined,
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
      });
  });

  it("should not be calling api to `Create Definition`", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/draft")
      .post("")
      .replyWithError({ status: 400, rawResponse: "Duplicate definition" });

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        data: "{\"Field1\": \"data\"}", description: "Draft definition",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
      });
  });

  it("should not be able to update a Definition successfully", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/draft/save")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        data: "{\"Field1\": \"data\"}", description: "Draft definition", status: "DRAFT", update: true, version: 1,
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
      });
  });

  describe("on POST /createdefinition when authorized", () => {
    beforeEach(() => {
      mock.cleanAll();
    });

    it("should redirect to Definitions list page on creating a Definition successfully", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451/api/draft")
        .post("")
        .reply(201);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/createdefinition")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          data: "{\"Field1\": \"data\"}", description: "Draft definition", version: undefined,
        })
        .expect(302)
        .then((res) => {
          expect(res.headers.location.startsWith("/definitions")).to.be.true;
        });
    });

    it("should respond with error if the Definition data is empty", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/createdefinition")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          data: "{}", description: "Draft definition",
        })
        .expect(302)
        .then((res) => {
          expect(res.headers.location.startsWith("/createdefinition")).to.be.true;
        });
    });

    it("should respond with Create Definition form due to server error", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451/api/draft")
        .post("")
        .replyWithError({status: 400, rawResponse: "Duplicate definition"});

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/createdefinition")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          data: "{\"Field1\": \"data\"}", description: "Draft definition",
        })
        .expect(302)
        .then((res) => {
          expect(res.headers.location.startsWith("/createdefinition")).to.be.true;
        });
    });

    it("should redirect to Definitions list page on updating a Definition successfully", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451/api/draft/save")
        .put("")
        .reply(200);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/createdefinition")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          data: "{\"Field1\": \"data\"}", description: "Draft definition", status: "DRAFT", update: true, version: 1,
        })
        .expect(302)
        .then((res) => {
          expect(res.headers.location.startsWith("/definitions")).to.be.true;
        });
    });
  });
});
