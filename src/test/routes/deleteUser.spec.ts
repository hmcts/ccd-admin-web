import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("Confirm Delete page", () => {
    describe("on POST /deleteuser", () => {

        it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "ccd-import");
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleteuser")
                .send({ idamId: "anas@yahoo.com", itemToDelete: "user" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/deleteitem?item=user&idamId=anas@yahoo.com")).to.be.true;
                });
        });
        it("should redirect to the User Profiles list when No is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "ccd-import");
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleteuser")
                .send({ deleteItem: "No", idamId: "anas@yahoo.com", itemToDelete: "user" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
                });
        });

        it("should redirect to the User Profiles list when Yes is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "ccd-import");
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4453")
                .delete("/users")
                .query({ uid: "anas@yahoo.com" })
                .reply(204);

            return request(appTest)
                .post("/deleteuser")
                .send({ deleteItem: "Yes", idamId: "anas@yahoo.com", itemToDelete: "user" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/userprofiles")).to.be.true;
                });
        });

        it("should redirect to the User Profiles list when Yes is chosen but an error occurred", () => {
            idamServiceMock.resolveRetrieveUserFor("1", "ccd-import");
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4453")
                .delete("/users")
                .query({ uid: "anas@yahoo.com" })
                .replyWithError(500);

            return request(appTest)
                .post("/deleteuser")
                .send({ deleteItem: "Yes", idamId: "anas@yahoo.com", itemToDelete: "user" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/deleteitem?item=user&idamId=anas@yahoo.com")).to.be.true;
                });
        });
    });
});
