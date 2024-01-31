import * as chai from "chai";
import * as nock from "nock";
import { JSDOM } from "jsdom";
import * as sinonChai from "sinon-chai";
import { get } from "config";
import { app } from "../../main/app";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import * as idamServiceMock from "../http-mocks/idam";
import * as request from "supertest";

const expect = chai.expect;
chai.use(sinonChai);

describe("test route Welsh Dictionary", () => {
  const idamBase = "http://localhost:4451";
  const tsBase = "http://localhost:4650";
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    nock.cleanAll();
  });

  describe("on GET /welshDictionary", () => {
    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/welshDictionary")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to
            .be.true;
        });
    });

    it("should not return Welsh Dictionary page when authenticated but not authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      nock(idamBase)
        .get("/api/idam/adminweb/authorization")
        .reply(200, { canImportDefinition: true });

      return request(app)
        .get("/welshDictionary")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const errorHeading = dom.window.document.querySelector("h2.heading-large.padding").innerHTML;
          expect(errorHeading).to.equal("Unauthorised role");
          expect(dom.window.document.querySelector(".govuk-fieldset__legend--xl")).to.be.null;
          const currentUserHiddenInput = dom.window.document
            .querySelector("#currentUser")
            .getAttribute("value");
          expect(currentUserHiddenInput).not.to.be.empty;
          const user = JSON.parse(currentUserHiddenInput);
          expect(user.forename).to.equal("Test");
          expect(user.surname).to.equal("User");
        });
    });

    it("should return Confirm Delete User Profile page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      nock(idamBase).get("/api/idam/adminweb/authorization").reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/welshDictionary")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const result =
            dom.window.document.querySelector(".heading-large").innerHTML;
          expect(result).to.equal("Welsh Dictionary");
          const currentUserHiddenInput = dom.window.document
            .querySelector("#currentUser")
            .getAttribute("value");
          expect(currentUserHiddenInput).not.to.be.empty;
          const user = JSON.parse(currentUserHiddenInput);
          expect(user.forename).to.equal("Test");
          expect(user.surname).to.equal("User");
        });
    });
  });

  describe("on GET /dictionary", () => {
    const dictionaryFromTS = `{
            "translations": {
                "Disputes the claim": {
                    "translation": "Gwrthwynebu’r hawliad",
                    "yesOrNo": false
                },
                "English Phrase 3": {
                    "translation": "English Phrase 3"
                }
            }
        }`.replace("/[s\n]{2,}/g", ""); // Strip formatting

    it("should return 403 when not authenticated", () => {
      return request(app)
        .get("/dictionary")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to
            .be.true;
        });
    });

    it("should not return dictionary as utf-8 csv", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      nock(idamBase)
        .get("/api/idam/adminweb/authorization")
        .reply(200, { canImportDefinition: true });

      return request(app)
        .get("/dictionary")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(403);
        });
    });

    it("should return dictionary as utf-8 csv", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      nock(idamBase).get("/api/idam/adminweb/authorization").reply(200, {});

      nock(tsBase).get("/dictionary").reply(200, dictionaryFromTS);

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/dictionary")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          const csv = res.text.replace("\ufeff\ufeff", "").split("\r\n");
          expect(res.text.startsWith("\ufeff\ufeff")).to.be.true;
          expect(csv[0]).to.equal("Disputes the claim,Gwrthwynebu’r hawliad");
          expect(csv[1]).to.equal("English Phrase 3,English Phrase 3");
          expect(res.statusCode).to.equal(200);
        });
    });
  });
});
