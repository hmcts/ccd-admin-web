import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
import { get } from "config";

describe("on Get /updateusersprofile", () => {
    beforeEach(() => {
        mock.cleanAll();
    });
    it("Update user should redirect to IdAM login page when not authenticated", () => {
        return request(app)
            .get("/updateusersprofile")
            .then((res) => {
                expect(res.statusCode).to.equal(302);
                expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
            });
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
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.text).to.contain("Jurisdiction 1");
                expect(res.text).to.contain("Jurisdiction 2");
            });
    });
});
