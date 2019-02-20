import { expect } from "chai";
import { isUserAuthorized } from "../../main/role/whitelist-roles-authorizer";

describe("Single role", () => {
  it("should not authorize when roles whitelist is empty", () => {
    const authorized = isUserAuthorized(["caseworker-test"], []);
    expect(authorized).to.be.false;
  });

  it("should authorize when the role is whitelisted", () => {
    const authorized = isUserAuthorized(["caseworker-test"], ["^caseworker-.+"]);
    expect(authorized).to.be.true;
  });

  it("should not authorize when the role is not whitelisted", () => {
    const authorized = isUserAuthorized(["role-test"], ["^caseworker-.+"]);
    expect(authorized).to.be.false;
  });
});

describe("Multiple roles", () => {
  it("should authorize when at least one role is whitelisted", () => {
    const authorized = isUserAuthorized(["role-test", "caseworker-test"], ["^caseworker-.+"]);
    expect(authorized).to.be.true;
  });

  it("should not authorize when no roles are whitelisted", () => {
    const authorized = isUserAuthorized(["role-test", "ccd-test"], ["^caseworker-.+", "^ccd-admin-.+"]);
    expect(authorized).to.be.false;
  });
});
