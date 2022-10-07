import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on GET /manageWelshDictionary", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  it("should respond with Welsh Translation csvfile response when authenticated and authorized", () => {
    it("should return Confirm Delete Definition page when authenticated and authorized", () => {
    idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
    idamServiceMock.resolveRetrieveServiceToken();

    mock("http://localhost:4451")
      .get("/api/idam/adminweb/authorization")
      .reply(200, {});

    return request(appTestWithAuthorizedAdminWebRoles)
      .get("/manageWelshDictionary")
      .send({
        currentJurisdiction: "TEST", description: "Test draft", version: 1,
      })
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
      });
  });
});
});
