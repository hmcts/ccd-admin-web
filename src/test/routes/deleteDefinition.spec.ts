import { appTest } from "../../main/app.test";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

describe("Confirm Delete page", () => {
    describe("on POST /deletedefinition", () => {
        const CCD_IMPORT_ROLE = "ccd-import";

        it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deletedefinition")
                .send({ definitionVersion: 1, itemToDelete: "definition", jurisdictionId: "TEST" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith(
                      "/deleteitem?item=definition&jurisdictionId=TEST&version=1")).to.be.true;
                });
        });
        it("should redirect to the Definitions list when No is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deletedefinition")
                .send({ definitionVersion: 1, deleteItem: "No", itemToDelete: "definition", jurisdictionId: "TEST" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/definitions")).to.be.true;
                });
        });

        it("should redirect to the Definitions list when Yes is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4451")
                .delete("/api/draft/TEST/1")
                .reply(204);

            return request(appTest)
                .post("/deletedefinition")
                .send({ definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith("/definitions")).to.be.true;
                });
        });

        it("should redirect to the Definitions list when Yes is chosen but an error occurred", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4451")
                .delete("/api/draft/TEST/1")
                .replyWithError(500);

            return request(appTest)
                .post("/deletedefinition")
                .send({ definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(302);
                    expect(res.headers.location.startsWith(
                      "/deleteitem?item=definition&jurisdictionId=TEST&version=1")).to.be.true;
                });
        });
    });
});
