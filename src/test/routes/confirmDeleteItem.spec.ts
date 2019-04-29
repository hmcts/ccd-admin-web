import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import { JSDOM } from "jsdom";
import * as request from "supertest";
import * as sinon from "sinon";

describe("Confirm Delete page", () => {
  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns("http://localhost:4453/users");
    mock.cleanAll();
  });

  describe("on GET /deleteitem", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/deleteitem")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should not return Confirm Delete User Profile page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(app)
        .get("/deleteitem")
        .query({ idamId: "anas@yahoo.com", item: "user" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          const dom = new JSDOM(res.text);
          expect (dom.window.document.querySelector(".govuk-fieldset__legend--xl")).to.be.null;
          expect (dom.window.document.querySelector("#currentUser").getAttribute("value")).to.be.empty;
        });
    });

    it("should not return Confirm Delete Definition page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(app)
        .get("/deleteitem")
        .query({ item: "definition" })
        .send({
          currentJurisdiction: "TEST", description: "Test draft", version: 1,
        })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          const dom = new JSDOM(res.text);
          expect (dom.window.document.querySelector(".govuk-fieldset__legend--xl")).to.be.null;
          expect (dom.window.document.querySelector("#currentUser").getAttribute("value")).to.be.empty;
        });
    });

    it("should return Confirm Delete User Profile page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/deleteitem")
        .query({ idamId: "anas@yahoo.com", item: "user" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector(".govuk-fieldset__legend--xl").innerHTML;
          expect(result).to.equal("Are you sure you would like to delete user anas@yahoo.com?");
          const currentUserHiddenInput = dom.window.document.querySelector("#currentUser").getAttribute("value");
          expect (currentUserHiddenInput).not.to.be.empty;
          const user = JSON.parse(currentUserHiddenInput);
          expect (user.forename).to.equal("Test");
          expect (user.surname).to.equal("User");
        });
    });

    it("should return Confirm Delete Definition page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/deleteitem")
        .query({ item: "definition" })
        .send({
          currentJurisdiction: "TEST", description: "Test draft", version: 1,
        })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector(".govuk-fieldset__legend--xl").innerHTML;
          expect(result).to.equal("Are you sure you would like to delete the selected definition?");
          const currentUserHiddenInput = dom.window.document.querySelector("#currentUser").getAttribute("value");
          expect (currentUserHiddenInput).not.to.be.empty;
          const user = JSON.parse(currentUserHiddenInput);
          expect (user.forename).to.equal("Test");
          expect (user.surname).to.equal("User");
        });
    });
  });
});
