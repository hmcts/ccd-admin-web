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

describe("on Get /create-user-role-form", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("Create user role should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/create-user-role-form")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should respond without populated response when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(app)
      .get("/create-user-role-form")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("PUBLIC");
        expect(res.text).not.to.contain("PRIVATE");
      });
  });

  it("should respond with create user roles form and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/create-user-role-form")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("PUBLIC");
        expect(res.text).to.contain("PRIVATE");
      });
  });
});

describe("on Get /user-roles-list", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("Create user role should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/user-roles-list")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should respond without user roles list when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {canImportDefinition: true});

    return request(app)
      .get("/user-roles-list")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Create User Role");
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
        expect(errorHeading).to.equal("Unauthorised role");
        // The "Import Case Definition" menu item should still be displayed (as this user is authorised for that)
        const menuItem = dom.window.document.querySelector("div.padding > a").innerHTML;
        expect(menuItem).to.equal("Import Case Definition");
      });
  });

  it("should respond with user roles list page and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/user-roles-list")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Create User Role");
      });
  });
});

describe("on Get /user-roles", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("Create user role should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/user-roles")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should not show user roles when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(app)
      .get("/user-roles")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Create User Role");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/user-roles")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Create User Role");
      });
  });
});

describe("on POST /createuserrole", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should not respond with user roles page or populated response when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .post("")
      .reply(200);

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with error when role is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .post("")
      .reply(200);

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/create-user-role-form")).to.be.true;
      });
  });

  it("should respond with error when classification is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .post("")
      .reply(200);

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
      });
  });

  it("should not respond with create user form due to server error when unauthorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .replyWithError({status: 400, rawResponse: "Bad request"});

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .post("")
      .reply(200);

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/user-roles-list")).to.be.true;
      });
  });

  it("should respond with create user form due to server error", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .replyWithError({status: 400, rawResponse: "Bad request"});

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
      });
  });
});

describe("on POST /updateuserrole", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should not respond with user roles page or populated response when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .reply(200);

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/user-roles-list")).to.be.true;
      });
  });

  it("should respond with error when role is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
      })
      .expect(200);
  });

  it("should respond with error when classification is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "",
        role: "ccd-admin",
      })
      .expect(200);
  });

  it("should respond with create user form due to server error", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .replyWithError({status: 400, rawResponse: "Bad request"});

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with create user form due to server error when authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/user-role")
      .put("")
      .replyWithError({status: 400, rawResponse: "Bad request"});

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
      });
  });
});

describe("on POST /updateuserroleform", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should not respond with update user form or populated response when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin", classification: "PUBLIC"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("ccd-admin");
        expect(res.text).not.to.contain("PUBLIC");
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with update user form and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updateuserroleform")
      .send({role: "ccd-admin", classification: "PUBLIC"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("ccd-admin");
        expect(res.text).to.contain("PUBLIC");
      });
  });

  it("should redirect with error message when invalid role is passed", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin*34", classification: "PUBLIC"})
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(302);
  });

  it("should redirect with error message when current jurisdiction is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin", classification: "PUBLIC)))"})
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(302);
  });
});
