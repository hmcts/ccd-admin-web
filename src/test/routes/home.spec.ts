import { app } from "../../main/app";
import { expect } from "chai";
import config from "config";
import { resolveRetrieveUserFor, resolveRetrieveServiceToken } from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import mock from "nock";
import request from "supertest";

describe("Home page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on GET /", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(config.get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should return Home page when authenticated", () => {
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(app)
        .get("/")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector("h1.govuk-heading-xl").innerHTML;
          expect(result).to.equal("Welcome to CCD Admin Web");
        });
    });
  });
});
