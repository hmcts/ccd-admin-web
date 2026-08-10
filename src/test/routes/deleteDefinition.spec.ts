import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as mock from "nock";
import * as request from "supertest";

beforeEach(() => {
  mock.cleanAll();
});

describe("Confirm Delete page", () => {
  describe("on POST /deletedefinition when not authorized", () => {

      it("should not redirect to the Confirm Delete page when Yes or No is not chosen", () => {

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          });
      });
      it("should not redirect to the Definitions list when No is chosen but unauthorized", () => {

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "No", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          });
      });

      it("should not redirect to the Definitions list when Yes is chosen but unauthorized", () => {

        mock("http://localhost:4451")
          .delete("/api/draft/TEST/1")
          .optionally()
          .reply(204);

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          });
      });

      it("should not redirect to the Definitions list when Yes is chosen when unauthorized", () => {

        mock("http://localhost:4451")
          .delete("/api/draft/TEST/1")
          .optionally()
          .reply(200);

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("<h2 class=\"heading-large padding\">Unauthorised role</h2>");
          });
      });
    });

  describe("on POST /deletedefinition when authorized", () => {

    it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {

      return request(appTestWithAuthorizedAdminWebRoles)
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

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deletedefinition")
        .send({ definitionVersion: 1, deleteItem: "No", itemToDelete: "definition", jurisdictionId: "TEST" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/definitions")).to.be.true;
        });
    });

    it("should redirect to the Definitions list when Yes is chosen", () => {

      mock("http://localhost:4451")
        .delete("/api/draft/TEST/1")
        .reply(204);

      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/deletedefinition")
        .send({ definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST" })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith("/definitions")).to.be.true;
        });
    });

    it("should redirect to the Definitions list when Yes is chosen but an error occurred", () => {

      mock("http://localhost:4451")
        .delete("/api/draft/TEST/1")
        .reply(500);

      return request(appTestWithAuthorizedAdminWebRoles)
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
