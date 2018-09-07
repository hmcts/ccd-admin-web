import { app } from "../../main/app";
import { appTest } from "../../main/app.test";
import { expect } from "chai";
import { get } from "config";
import * as sinon from "sinon";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("Confirm Delete page", () => {
    beforeEach(() => {
        const config = {
            get: sinon.stub(),
        };
        config.get.withArgs("adminWeb.userprofiles_url").returns("http://localhost:4453/users");
    });

    describe("on GET /deleteuserprofile", () => {

        it("should redirect to import page when not authenticated", () => {
            return request(app)
                .get("/deleteuserprofile")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
                });
        });

        it("should return Confirm delete user profile page when authenticated", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "admin");
            idamServiceMock.resolveRetrieveServiceToken();

            return request(app)
                .get("/deleteuserprofile")
                .query({ idamId: "anas@yahoo.com" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(200);
                    const dom = new JSDOM(res.text);
                    const result = dom.window.document.querySelector(".govuk-fieldset__legend--xl").innerHTML;
                    expect(result).to.equal("Are you sure you would like to delete user anas@yahoo.com?");
                });
        });

    });

    describe("on POST /deleteuserprofile", () => {

        it("should redirect to the confirm delete page when Yes or No is not chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "admin");
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleteuserprofile")
                .send({ idamId: "anas@yahoo.com" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/deleteuserprofile?idamId=anas@yahoo.com")).to.be.true;
                });
        });
        it("should redirect to the User profiles list when No is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "admin");
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleteuserprofile")
                .send({ deleteUser: "No", idamId: "anas@yahoo.com" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
                });
        });

        it("should redirect to the User profiles list when Yes is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "admin");
            idamServiceMock.resolveRetrieveServiceToken();
            const headers = {
                Authorization: "userAuthToken",
                ServiceAuthorization: "serviceAuthToken",
            };

            mock("http://localhost:4453")
                .delete("/users")
                .query({ uid: "anas@yahoo.com" })
                .reply(204);

            return request(appTest)
                .post("/deleteuserprofile")
                .set(headers)
                .send({ deleteUser: "Yes", idamId: "anas@yahoo.com" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
                });
        });

        it("should redirect to the User profiles list when Yes but an error occurred", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "admin");
            idamServiceMock.resolveRetrieveServiceToken();

            const headers = {
                Authorization: "userAuthToken",
                ServiceAuthorization: "serviceAuthToken",
            };

            mock("http://localhost:4453")
                .delete("/users")
                .query({ uid: "anas@yahoo.com" })
                .replyWithError(500);

            return request(appTest)
                .post("/deleteuserprofile")
                .set(headers)
                .send({ deleteUser: "Yes", idamId: "anas@yahoo.com" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/deleteuserprofile?idamId=anas@yahoo.com")).to.be.true;
                });
        });
    });
});
