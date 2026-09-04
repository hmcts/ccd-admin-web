import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as mock from "nock";
import * as request from "supertest";

describe("on POST /updateuser", () => {

  beforeEach(() => {
    mock.cleanAll();
  });

  it("should respond with update user form and populated response when authenticated but not authorized", () => {
    let backendCalled = false;
    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .optionally()
      .reply(() => {
        backendCalled = true;
        return [200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]];
      });

    return request(appTest)
      .post("/updateuser")
      .send({ idamId: "anas@yahoo.com", currentjurisdiction: "test" })
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(backendCalled).to.be.false;
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Jurisdiction 1");
        expect(res.text).not.to.contain("Jurisdiction 2");
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with update user form and populated response when authenticated and authorized", () => {
      mock("http://localhost:4451")
        .get("/api/data/jurisdictions")
        .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

      return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updateuser")
      .send({idamId: "anas@yahoo.com", currentjurisdiction: "test"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Jurisdiction 1");
        expect(res.text).to.contain("Jurisdiction 2");
      });
  });

  it("should redirect with error message when invalid email id is passed", () => {

    return request(appTest)
      .post("/updateuser")
      .send({idamId: "anasyahoo.com", currentjurisdiction: "test"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
      });
  });

  it("should redirect with error message when current jurisdiction is empty", () => {

    return request(appTest)
      .post("/updateuser")
      .send({idamId: "anas@yahoo.com"})
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.headers.location.startsWith("/jurisdiction")).to.be.true;
      });
  });
});
