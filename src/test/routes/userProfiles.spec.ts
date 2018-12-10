import { appTest } from "../../main/app.test";
import * as sinon from "sinon";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest-session";
import { expect } from "chai";

describe("User profile page", () => {

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns("userprofiles_url");
  });

  describe("on GET /userprofiles", () => {
    it("should return jurisdictions list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      return request(appTest)
        .get("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Case Type 3");
          expect(res.text).to.contain("Jurisdiction 3");
        });
    });
  });

  describe("on POST /userprofiles", () => {
    it("should return jurisdictions list", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }]);

      return request(appTest)
        .post("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Case Type 3");
          expect(res.text).to.contain("Jurisdiction 3");
        });
    });
    it("should return error from the server", () => {
      idamServiceMock.resolveRetrieveUserFor("1", "admin");
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .replyWithError({ code: 500, text: "Server Error" });

      return request(appTest)
        .post("/userprofiles")
        .set("Cookie", "accessToken=ey123.ey456")
        .send({
          jurisdictionName: "Mike",
        })
        .then((res) => {
          expect(res.status).to.equal(500);
        });
    });
  });
});
