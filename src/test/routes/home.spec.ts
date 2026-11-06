import { app } from "../../main/app";
import { expect } from "chai";
import config from "config";
import { resolveRetrieveUserFor, optionallyResolveRetrieveServiceToken } from "../http-mocks/idam";
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
          expect(res.headers.location.startsWith(config.get("idam.web_public_url"))).to.be.true;
        });
    });

    it("should return Home page when authenticated", () => {
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      optionallyResolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(app)
        .get("/")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          const dom = new JSDOM(res.text);
          const footer = dom.window.document.querySelector("footer.govuk-template__footer.app-footer");
          const footerComponent = footer?.querySelector(".govuk-footer");
          const footerCrown = footerComponent?.querySelector(".govuk-width-container .govuk-footer__crown");
          expect(footer).to.exist;
          expect(footerComponent).to.exist;
          expect(footerCrown).to.exist;
          expect(footerComponent?.querySelector(".govuk-footer__meta")).to.exist;
          expect(footerComponent?.querySelector(".govuk-footer__licence-logo")).to.exist;
          expect(footerComponent?.querySelector(".govuk-footer__copyright-logo")).to.exist;
          const genericHeader = dom.window.document.querySelector(".govuk-generic-header");
          expect(genericHeader).not.to.be.null;
          expect(genericHeader?.querySelector(".govuk-generic-header__homepage-link")?.textContent?.trim()).to.equal("CCD Admin Web");
          expect(dom.window.document.querySelector(".govuk-header")).to.be.null;
          expect(dom.window.document.querySelector('link[rel="icon"][href="/favicon.ico"]')).not.to.be.null;
          expect(dom.window.document.querySelector('link[rel="mask-icon"]')?.getAttribute("color")).to.equal("#0b0c0c");
          expect(dom.window.document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).to.equal("#0b0c0c");
          const result = dom.window.document.querySelector("h1.govuk-heading-xl").innerHTML;
          expect(result).to.equal("Welcome to CCD Admin Web");
        });
    });
  });
});
