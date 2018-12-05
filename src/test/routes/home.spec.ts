import { app } from "../../main/app";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("Home page", () => {
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

    it("should return Import Case Definition page when authenticated", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, []);

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(201);
        });
    });
  });

  describe("on GET /", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should redirect to Import Case Definition page when authenticated", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();

      return request(app)
        .get("/")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");
        });
    });
  });
});
