import { appTest } from "../../main/app.test";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import { resolveRetrieveUserFor, resolveRetrieveServiceToken } from "../http-mocks/idam";
import mock from "nock";
import request from "supertest";

beforeEach(() => {
  mock.cleanAll();
});

describe("Confirm Delete page", () => {
  describe("on POST /deletedefinition when not authorized", () => {
      const CCD_IMPORT_ROLE = "ccd-import";

      it("should not redirect to the Confirm Delete page when Yes or No is not chosen", () => {
        resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        resolveRetrieveServiceToken();

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("Unauthorised role");
            expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
          });
      });
      it("should not redirect to the Definitions list when No is chosen but unauthorized", () => {
        resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        resolveRetrieveServiceToken();

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "No", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("Unauthorised role");
            expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
          });
      });

      it("should not redirect to the Definitions list when Yes is chosen but unauthorized", () => {
        resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        resolveRetrieveServiceToken();

        mock("http://localhost:4451")
          .delete("/api/draft/TEST/1")
          .reply(204);

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("Unauthorised role");
            expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
          });
      });

      it("should not redirect to the Definitions list when Yes is chosen when unauthorized", () => {
        resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        resolveRetrieveServiceToken();

        mock("http://localhost:4451")
          .delete("/api/draft/TEST/1")
          .reply(200);

        return request(appTest)
          .post("/deletedefinition")
          .send({definitionVersion: 1, deleteItem: "Yes", itemToDelete: "definition", jurisdictionId: "TEST"})
          .set("Cookie", "accessToken=ey123.ey456")
          .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.headers.location).to.be.undefined;
            expect(res.text).to.contain("Unauthorised role");
            expect(res.text).to.contain("<h1 class=\"govuk-error-summary__title\">");
          });
      });
    });

  describe("on POST /deletedefinition when authorized", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    it("should redirect to the Confirm Delete page when Yes or No is not chosen", () => {
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      resolveRetrieveServiceToken();

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
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      resolveRetrieveServiceToken();

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
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      resolveRetrieveServiceToken();

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
      resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      resolveRetrieveServiceToken();

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
