import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("rolesBasedAuthorizer", () => {

  const user = {
    id: 1,
    roles: ["caseworker-test", "role-test"],
  };
  const whitelist = "caseworker-test,role-test";
  let whitelistRolesAuthorizer;
  let rolesBasedAuthorizer;

  beforeEach(() => {
    whitelistRolesAuthorizer = {
      isUserAuthorized: sinon.stub(),
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("security.roles_whitelist").returns(whitelist);

    rolesBasedAuthorizer = proxyquire("../../main/role/roles-based-authorizer", {
      "./whitelist-roles-authorizer": whitelistRolesAuthorizer,
      config,
    }).isUserAuthorized;
  });

  describe("User has a whitelisted role", () => {
    it("should authorize the user", () => {
      whitelistRolesAuthorizer.isUserAuthorized.returns(true);

      expect(rolesBasedAuthorizer(user)).to.be.true;
    });
  });

  describe("User does not have a whitelisted role", () => {
    it("should not authorize the user", () => {
      whitelistRolesAuthorizer.isUserAuthorized.returns(false);

      expect(rolesBasedAuthorizer(user)).to.be.false;
    });
  });
});
