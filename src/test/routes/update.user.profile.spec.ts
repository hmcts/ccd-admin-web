
import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("on POST /updateusersprofile", () => {
    beforeEach(() => {
        mock.cleanAll();
    });

    it("should respond with update user form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4451")
            .get("/api/data/jurisdictions")
            .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

        return request(appTest)
            .post("/updateusersprofile")
            .send({ idamId: "anas@yahoo.com", currentjurisdiction: "test" })
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.text).to.contain("Jurisdiction 1");
                expect(res.text).to.contain("Jurisdiction 2");
            });
    });

    it("should redirect with error message when invalid email id is passed", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };

        return request(appTest)
            .post("/updateusersprofile")
            .send({ idamId: "anasyahoo.com", currentjurisdiction: "test" })
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .expect(302);
    });

    it("should redirect with error message when current jurisdiction is empty", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };

        return request(appTest)
            .post("/updateusersprofile")
            .send({ idamId: "anas@yahoo.com" })
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .expect(302);
    });
});
