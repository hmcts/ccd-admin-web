import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as request from "supertest";

// Based on "deleteUser.spec.ts".   **** Converted from USER to ROLE ****

describe("Confirm Delete page", () => {
  describe("on POST /deleterole when unauthorized", () => {
        const CCD_IMPORT_ROLE = "ccd-import";

        it("TEST 1 - should redirect to the Confirm Delete page when Yes or No is not chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleterole")
                .send({ role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers.location).to.be.undefined;
                    expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
                });
        });
        it("TEST 2 - should redirect to the Roles list when No is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "No", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
                });
        });

        it("TEST 3 - should redirect to the Roles list when Yes is chosen", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4453")
                .delete("/api/user-role")
                .query({ role: "test-role" })
                .reply(204);

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
                });
        });

        it("TEST 4 - should redirect to the Roles list when Yes is chosen but an error occurred", () => {
            idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
            idamServiceMock.resolveRetrieveServiceToken();

            mock("http://localhost:4453")
                .delete("/api/user-role")
                .query({ role: "test-role" })
                .replyWithError(500);

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
                });
        });
    });

  describe("on POST /deleterole when authorized", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    it("TEST 5 - should redirect to the Confirm Delete page when Yes or No is not chosen", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/deleteitem?item=role&roleParameter=test-role")).to.be.true;
        });
    });
    it("TEST 6 - should redirect to the Roles list when No is chosen", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ deleteItem: "No", role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/user-roles")).to.be.true;
        });
    });

    it("TEST 7 - should redirect to the Roles list when Yes is chosen", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4453")
        .delete("/api/user-role")
        .query({ role: "test-role" })
        .reply(204);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          // expect(res.headers.location.startsWith("/user-roles")).to.be.true;
        });
    });

    it("TEST 8 - should redirect to the Roles list when Yes is chosen but an error occurred", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4453")
        .delete("/api/user-role")
        .query({ role: "test-role" })
        .replyWithError(500);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/deleteitem?item=role&roleParameter=test-role")).to.be.true;
        });
    });
  });
});
