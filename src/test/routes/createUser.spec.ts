import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
import { get } from "config";

const CCD_IMPORT_ROLE = "ccd-import";

describe("on Get /createuser", () => {
  beforeEach(() => {
    mock.cleanAll();
  });
  it("Create user should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/createuser")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should not respond with create user form when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{id: "jd_1", name: "Jurisdiction 1"}, {id: "jd_2", name: "Jurisdiction 2"}]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(app)
      .get("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Jurisdiction 1");
        expect(res.text).not.to.contain("Jurisdiction 2");
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with create user form and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{id: "jd_1", name: "Jurisdiction 1"}, {id: "jd_2", name: "Jurisdiction 2"}]);

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {canManageUserRole: true});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Jurisdiction 1");
        expect(res.text).to.contain("Jurisdiction 2");
      });
  });

  it("should handle error when accessing create user form page when not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .replyWithError({status: 400, rawResponse: "Duplicate values"});

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, [{}]);

    return request(app)
      .get("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      // not calling /api/data/jurisdiction because not authorized
      .expect(200);
  });

  it("should handle error when accessing create user form page when authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .replyWithError({status: 400, rawResponse: "Duplicate values"});

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(400);
  });
});

describe("on POST /createuser", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should respond with create user form when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453/users/save")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anas@yahoo.com",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with create user form and populated response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453/users/save")
      .put("")
      .reply(200);

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anas@yahoo.com",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
      });
  });

  it("should respond with error when invalid email is passed", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453/users")
      .put("")
      .reply(200);

    return request(appTest)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anasyahoo.com",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/createuser")).to.be.true;
      });
  });

  it("should respond with error when jurisdiction is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTest)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", idamId: "anasyahoo.com",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/jurisdiction")).to.be.true;
      });
  });

  it("should not respond with create user form when not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453/users/save")
      .put("")
      .replyWithError({status: 400, rawResponse: "Duplicate values"});

    return request(appTest)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", currentjurisdiction: "test",
        idamId: "anas@yahoo.com", jurisdiction: "test2",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(200)
      .then((res) => {
        expect(res.headers.location).to.be.undefined;
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with create user form due to server error", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4453/users/save")
      .put("")
      .replyWithError({status: 400, rawResponse: "Duplicate values"});

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/createuser")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        caseTypeDropdown: "caseType", currentjurisdiction: "test",
        idamId: "anas@yahoo.com", jurisdiction: "test2",
        jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/createuser")).to.be.true;
      });
  });
});
