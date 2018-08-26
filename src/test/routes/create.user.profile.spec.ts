import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
import { get } from "config";

describe("on Get /createuser", () => {
    beforeEach(() => {
        mock.cleanAll();
    });
    it("Create user should redirect to IdAM login page when not authenticated", () => {
        return request(app)
            .get("/createuser")
            .then((res) => {
                expect(res.statusCode).to.equal(302);
                expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
            });
    });

    it("should respond with create user form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        mock("http://localhost:4451")
            .get("/api/data/jurisdictions")
            .reply(200, [{ id: "jd_1", name: "Jurisdiction 1" }, { id: "jd_2", name: "Jurisdiction 2" }]);

        return request(app)
            .get("/createuser")
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.text).to.contain("Jurisdiction 1");
                expect(res.text).to.contain("Jurisdiction 2");
            });
    });

    it("should handle error when accessing create user form page", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        mock("http://localhost:4451")
            .get("/api/data/jurisdictions")
            .replyWithError({ status: 400, rawResponse: "Duplicate values" });

        return request(app)
            .get("/createuser")
            .set("Cookie", "accessToken=ey123.ey456")
            .expect(400);
    });
});

describe("on POST /createuser", () => {
    beforeEach(() => {
        mock.cleanAll();
    });

    it("should respond with create user form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4453/users")
            .put("")
            .reply(200);

        return request(appTest)
            .post("/createuser")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anas@yahoo.com",
                jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
            });
    });

    it("should respond with error when invalid email is passed", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4453/users")
            .put("")
            .reply(200);

        return request(appTest)
            .post("/createuser")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anasyahoo.com",
                jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/createuser")).to.be.true;
            });
    });
    it("should respond with error when jurisdiction is empty", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };

        return request(appTest)
            .post("/createuser")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                caseTypeDropdown: "caseType", idamId: "anasyahoo.com",
                jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/jurisdiction")).to.be.true;
            });
    });
    it("should respond with create user form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4453/users")
            .put("")
            .replyWithError({ status: 400, rawResponse: "Duplicate values" });

        return request(appTest)
            .post("/createuser")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                caseTypeDropdown: "caseType", currentjurisdiction: "test", idamId: "anas@yahoo.com",
                jurisdictionDropdown: "jurisdiction", stateDropdown: "state",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/createuser")).to.be.true;
            });
    });
});
