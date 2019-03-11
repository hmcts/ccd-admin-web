import { app } from "../../main/app";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
import { get } from "config";

describe("Jurisdiction page", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on Get /jurisdiction", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    it("Jurisdiction should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/jurisdiction")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should return jurisdiction list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/data/jurisdictions")
        .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, [{}]);

      return request(app)
        .get("/jurisdiction")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Jurisdiction 1");
          expect(res.text).to.contain("Jurisdiction 2");
        });
    });
  });
});
