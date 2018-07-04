import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { User } from "domain/User";

const expect = chai.expect;
chai.use(sinonChai);

describe("userprofileService", () => {

  const importUrl = "http://localhost:9999/userprofiles";

 
  let fetchUsers;

  beforeEach(() => {
  
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.import_url").returns(importUrl);

    fetchUsers = proxyquire("../../main/service/user.profiles.service", {
      config,
    }).fetchUsers;
  });

  describe("successful call to fetchUser", () => {
    it("should return a user object", () => {
      let user:User =  fetchUsers(new User("10001","jurdictionname"));
      expect(user.id).to.equal("10001");
      expect(user.jurisdictionname).to.equal("jurdictionname");
    
    });
  });

});
