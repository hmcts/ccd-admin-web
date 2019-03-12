import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on POST /updatedefinition", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  it("should respond with Update Definition form populated with response when authenticated but not authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    return request(appTest)
      .post("/updatedefinition")
      .type("form") // Sends the data as application/x-www-form-urlencoded
      .send({ description: "Test draft Definition", status: "DRAFT", version: 1 })
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).not.to.contain("Jurisdiction 1");
        expect(res.text).not.to.contain("Jurisdiction 2");
        expect(res.text).not.to.contain("Test draft Definition");
        expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
      });
  });

  it("should respond with Update Definition form populated with response when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();
    mock("http://localhost:4451")
      .get("/api/data/jurisdictions")
      .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

    return request(appTestWithAuthorizedAdminWebRoles)
      .post("/updatedefinition")
      .type("form") // Sends the data as application/x-www-form-urlencoded
      .send({ description: "Test draft Definition", status: "DRAFT", version: 1 })
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.contain("Jurisdiction 1");
        expect(res.text).to.contain("Jurisdiction 2");
        expect(res.text).to.contain("Test draft Definition");
      });
  });
});
