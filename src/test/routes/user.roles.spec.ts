import { app } from "app";
import { appTest } from "app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
import { get } from "config";

describe("on Get /create-user-role-form", () => {
    beforeEach(() => {
        mock.cleanAll();
    });
    it("Create user role should redirect to IdAM login page when not authenticated", () => {
        return request(app)
            .get("/create-user-role-form")
            .then((res) => {
                expect(res.statusCode).to.equal(302);
                expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
            });
    });

    it("should respond with create user roles form and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        return request(app)
            .get("/create-user-role-form")
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.text).to.contain("PUBLIC");
                expect(res.text).to.contain("PRIVATE");
            });
    });
});

describe("on Get /user-roles-list", () => {
    beforeEach(() => {
        mock.cleanAll();
    });
    it("Create user role should redirect to IdAM login page when not authenticated", () => {
        return request(app)
            .get("/user-roles-list")
            .then((res) => {
                expect(res.statusCode).to.equal(302);
                expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
            });
    });

    it("should respond with user roles list page and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        return request(app)
            .get("/user-roles-list")
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.text).to.contain("Create User Role");
            });
    });
});

describe("on Get /user-roles", () => {
    beforeEach(() => {
        mock.cleanAll();
    });
    it("Create user role should redirect to IdAM login page when not authenticated", () => {
        return request(app)
            .get("/user-roles")
            .then((res) => {
                expect(res.statusCode).to.equal(302);
                expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
            });
    });

    it("should respond with user roles page and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();

        return request(app)
            .get("/user-roles")
            .set("Cookie", "accessToken=ey123.ey456")
            .then((res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.text).to.contain("Create User Role");
            });
    });
});

describe("on POST /createuserrole", () => {
    beforeEach(() => {
        mock.cleanAll();
    });

    it("should respond with user roles page and populated response when authenticated", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4451/api/user-role")
            .put("")
            .reply(200);

        return request(appTest)
            .post("/createuserrole")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                classification: "PUBLIC",
                role: "ccd-admin",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/user-roles-list")).to.be.true;
            });
    });

    it("should respond with error when role is empty", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4451/api/user-role")
            .put("")
            .reply(200);

        return request(appTest)
            .post("/createuserrole")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                classification: "PUBLIC",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
            });
    });

    it("should respond with error when classification is empty", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4451/api/user-role")
            .put("")
            .reply(200);

        return request(appTest)
            .post("/createuserrole")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                classification: "",
                role: "ccd-admin",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
            });
    });

    it("should respond with create user form due to server error", () => {
        idamServiceMock.resolveRetrieveUserFor("1", "admin");
        idamServiceMock.resolveRetrieveServiceToken();
        const headers = {
            Authorization: "userAuthToken",
            ServiceAuthorization: "serviceAuthToken",
        };
        mock("http://localhost:4451/api/user-role")
            .put("")
            .replyWithError({ status: 400, rawResponse: "Bad request" });

        return request(appTest)
            .post("/createuserrole")
            .set(headers)
            .set("Cookie", "accessToken=ey123.ey456")
            .send({
                classification: "PUBLIC",
                role: "ccd-admin",
            })
            .expect(302)
            .then((res) => {
                expect(res.headers.location.startsWith("/create-user-role")).to.be.true;
            });
    });
});
