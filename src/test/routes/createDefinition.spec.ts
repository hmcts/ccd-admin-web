import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on GET /createdefinition", () => {
  beforeEach(() => {
    mock.cleanAll();
  });
  it("Create Definition should redirect to IdAM login page when not authenticated", () => {
    return request(app)
      .get("/createdefinition")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
      });
  });

  it("should respond with Create Definition form and populated response when authenticated", () => {
    idamServiceMock.resolveRetrieveUserFor("1", "admin");
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    return request(app)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Jurisdiction 1");
        expect(res.text).to.contain("Jurisdiction 2");
      });
  });

  it("should handle error when accessing Create Definition form page", () => {
    idamServiceMock.resolveRetrieveUserFor("1", "admin");
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .replyWithError({ status: 400, rawResponse: "Duplicate values" });

    return request(app)
      .get("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .expect(400);
  });
});

describe("on POST /createdefinition", () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  it("should redirect to Definitions list page on creating a Definition successfully", () => {
    idamServiceMock.resolveRetrieveUserFor("1", "admin");
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/draft")
      .post("")
      .reply(200);

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        data: "Test data", description: "Draft definition",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/definitions")).to.be.true;
      });
  });

  it("should respond with error if the Definition data is empty", () => {
    idamServiceMock.resolveRetrieveUserFor("1", "admin");
    idamServiceMock.resolveRetrieveServiceToken();

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        description: "Draft definition",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/createdefinition")).to.be.true;
      });
  });

  it("should respond with Create Definition form due to server error", () => {
    idamServiceMock.resolveRetrieveUserFor("1", "admin");
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451/api/draft")
      .post("")
      .replyWithError({ status: 400, rawResponse: "Duplicate definition" });

    return request(appTest)
      .post("/createdefinition")
      .set("Cookie", "accessToken=ey123.ey456")
      .send({
        data: "Test data", description: "Draft definition",
      })
      .expect(302)
      .then((res) => {
        expect(res.headers.location.startsWith("/createdefinition")).to.be.true;
      });
  });
});