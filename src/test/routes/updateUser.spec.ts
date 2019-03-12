import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on POST /updateuser", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    beforeEach(() => {
        mock.cleanAll();
    });

    it("should respond with update user form and populated response when authenticated but not authorized", () => {
        idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        idamServiceMock.resolveRetrieveServiceToken();
        mock("http://localhost:4451")
            .get("/api/data/jurisdictions")
            .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

        return request(appTest)
            .post("/updateuser")
            .send({ idamId: "anas@yahoo.com", currentjurisdiction: "test" })
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.text).not.to.contain("Jurisdiction 1");
                expect(res.text).not.to.contain("Jurisdiction 2");
                expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
            });
    });

    it("should respond with update user form and populated response when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://localhost:4451")
        .get("/api/data/jurisdictions")
        .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/updateuser")
        .send({ idamId: "anas@yahoo.com", currentjurisdiction: "test" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("Jurisdiction 1");
          expect(res.text).to.contain("Jurisdiction 2");
        });
    });

    it("should redirect with error message when invalid email id is passed", () => {
        idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        idamServiceMock.resolveRetrieveServiceToken();

        return request(appTest)
            .post("/updateuser")
            .send({ idamId: "anasyahoo.com", currentjurisdiction: "test" })
            .set("Cookie", "accessToken=ey123.ey456")
            .expect(302);
    });

    it("should redirect with error message when current jurisdiction is empty", () => {
        idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        idamServiceMock.resolveRetrieveServiceToken();

        return request(appTest)
            .post("/updateuser")
            .send({ idamId: "anas@yahoo.com" })
            .set("Cookie", "accessToken=ey123.ey456")
            .expect(302);
    });
});
