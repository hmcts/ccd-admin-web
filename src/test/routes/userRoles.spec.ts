import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import config from "config";
import { JSDOM } from "jsdom";
import { resolveRetrieveUserFor, optionallyResolveRetrieveServiceToken } from "../http-mocks/idam";
import mock from "nock";
import request from "supertest";

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
        expect(res.headers.location.startsWith(config.get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should respond without populated response when authenticated but not authorized", () => {
    resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    optionallyResolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

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
        expect(res.headers.location.startsWith(config.get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should respond without user roles list when authenticated but not authorized", () => {
    resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    optionallyResolveRetrieveServiceToken();
    let backendCalled = false;
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200, [{
        role: "admin",
        security_classification: "PUBLIC",
        }]];
      });

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {canImportDefinition: true});

    return request(app)
      .get("/user-roles-list")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Create User Role");
        const dom = new JSDOM(res.text);
        const errorHeading = dom.window.document.querySelector("h1.govuk-error-summary__title").innerHTML;
        expect(errorHeading).to.contain("Unauthorised role");
        // The "Import Case Definition" menu item should still be displayed (as this user is authorised for that)
        const menuItem = dom.window.document.querySelector("nav > ul > li > a").innerHTML;
        expect(menuItem).to.contain("Import Case Definition");
      });
  });

  it("should respond with user roles list page and populated response when authenticated and authorized", () => {
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

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
        expect(res.headers.location.startsWith(config.get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should not show user roles when authenticated but not authorized", () => {
    resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    optionallyResolveRetrieveServiceToken();
    let backendCalled = false;
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200, [{
        role: "admin",
        security_classification: "PUBLIC",
        }]];
      });

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    return request(app)
      .get("/user-roles")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Create User Role");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
    mock("http://localhost:4451")
      .get("/api/user-roles")
      .reply(200, [{
        role: "admin",
        security_classification: "PUBLIC",
      }]);

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
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .post("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("Unauthorised role");
        expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
      });
  });

  it("should reject an empty role without calling the back-end", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .post("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
      })
      .expect(302)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location.startsWith("/create-user-role-form")).to.be.true;
      });
  });

  it("should reject an empty classification without calling the back-end", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .post("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "",
        role: "ccd-admin",
      })
      .expect(302)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
      });
  });

  it("should not call the back-end when creating without authorisation", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .post("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [400, {message: "Bad request"}];
      });

    return request(appTest)
      .post("/createuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("Unauthorised role");
        expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
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

  it("should redirect to the create-role form after an HTTP 400 response", () => {
    mock("http://localhost:4451/api/user-role")
      .post("")
      .reply(400, {message: "Bad request"});

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
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .put("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("Unauthorised role");
        expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
      });
  });

  it("should respond with user roles page and populated response when authenticated and authorized", () => {
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

  it("should reject an empty role without calling the back-end", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .put("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
      })
      .expect(200)
      .then(() => expect(backendCalled).to.be.false);
  });

  it("should reject an empty classification without calling the back-end", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .put("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200];
      });

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "",
        role: "ccd-admin",
      })
      .expect(200)
      .then(() => expect(backendCalled).to.be.false);
  });

  it("should not call the back-end when updating without authorisation", () => {
    let backendCalled = false;
    mock("http://localhost:4451/api/user-role")
      .put("")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [400, {message: "Bad request"}];
      });

    return request(appTest)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .expect(200)
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("Unauthorised role");
        expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
      });
  });

  it("should redirect to the create-role form after an HTTP 400 response when authorized", () => {
    mock("http://localhost:4451/api/user-role")
      .put("")
      .reply(400, {message: "Bad request"});

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updateuserrole")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        classification: "PUBLIC",
        role: "ccd-admin",
      })
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
      });
  });
});

describe("on POST /updateuserroleform", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should not respond with update user form or populated response when authenticated but not authorized", () => {

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin", classification: "PUBLIC"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("ccd-admin");
        expect(res.text).not.to.contain("PUBLIC");
        expect(res.text).to.contain("Unauthorised role");
        expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
      });
  });

  it("should respond with update user form and populated response when authenticated and authorized", () => {

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

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin*34", classification: "PUBLIC"})
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(302);
  });

  it("should redirect with error message when current jurisdiction is empty", () => {

    return request(appTest)
      .post("/updateuserroleform")
      .send({role: "ccd-admin", classification: "PUBLIC)))"})
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(302);
  });
});
