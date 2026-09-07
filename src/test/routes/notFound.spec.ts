import { expect } from "chai";
import request from "supertest";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";

describe("not found page", () => {
  it("returns the not found page for an unmatched route", async () => {
    const response = await request(appTestWithAuthorizedAdminWebRoles)
      .get("/route-that-does-not-exist");

    expect(response.status).to.equal(404);
    expect(response.text).to.contain("Page not found");
  });
});
