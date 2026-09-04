import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import mock from "nock";
import request from "supertest";

describe("Confirm Delete page", () => {
  describe("on POST /deleterole when unauthorized", () => {

        it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {

            return request(appTest)
                .post("/deleterole")
                .send({ role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.headers.location).to.be.undefined;
                    expect(res.text).to.contain("Unauthorised role");
                    expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
                });
        });
        it("should redirect to the Roles list when No is chosen", () => {

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "No", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("Unauthorised role");
                  expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
                });
        });

        it("should redirect to the Roles list when Yes is chosen", () => {
            let backendCalled = false;
            mock("http://localhost:4451")
                .delete("/api/user-role")
                .query({ role: "test-role" })
                .optionally()
                .reply(() => {
                    backendCalled = true;
                    return [204];
                });

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(backendCalled).to.be.false;
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("Unauthorised role");
                  expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
                });
        });

        it("should redirect to the Roles list when Yes is chosen but an error occurred", () => {
            let backendCalled = false;

            mock("http://localhost:4451")
                .delete("/api/user-role")
                .query({ role: "test-role" })
                .optionally()
                .reply(() => {
                    backendCalled = true;
                    return [500];
                });

            return request(appTest)
                .post("/deleterole")
                .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
                .set("Cookie", "accessToken=ey123.ey456")
                .then((res) => {
                  expect(backendCalled).to.be.false;
                  expect(res.statusCode).to.equal(200);
                  expect(res.headers.location).to.be.undefined;
                  expect(res.text).to.contain("Unauthorised role");
                  expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
                });
        });
    });

  describe("on POST /deleterole when authorized", () => {

    it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/deleteitem?item=role&roleParameter=test-role")).to.be.true;
        });
    });
    it("should redirect to the Roles list when No is chosen", () => {

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ deleteItem: "No", role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/user-roles")).to.be.true;
        });
    });

    it("should redirect to the Roles list when Yes is chosen", () => {

      mock("http://localhost:4451")
        .delete("/api/user-role")
        .query({ role: "test-role" })
        .reply(204);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deleterole")
        .send({ deleteItem: "Yes", role: "test-role", itemToDelete: "role" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/user-roles");
        });
    });

    it("should redirect to the Roles list when Yes is chosen but an error occurred", () => {

      mock("http://localhost:4451")
        .delete("/api/user-role")
        .query({ role: "test-role" })
        .reply(500);

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
