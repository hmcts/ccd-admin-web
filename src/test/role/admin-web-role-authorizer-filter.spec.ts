import { expect } from "chai";
import Debug from "debug";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("admin-web-role-authorizer-filter", () => {

  const adminWebAuthorizationUrl = "http://adminweb/authorize";
  const authorization = {canDance: true, canDrink: false};
  const CCD_IMPORT_ROLE = "ccd-import";
  const loginUrl = "http://idam.login";
  const clientId = "ccd_admin";
  let filter;
  let req;
  let res;
  const debug = Debug("ccd-admin-web:admin-web-role-authorizer-filter-spec");

  beforeEach(() => {
    mock.cleanAll();
    req = {
      accessToken: "userAuthToken",
      get: sinon.stub(),
      protocol: "http",
      serviceAuthToken: "serviceToken",
    };
    req.get.withArgs("host").returns("localhost");
    res = {};

    const config = {
      get: sinon.stub(),
    };

    config.get.withArgs("adminWeb.authorization_url").returns(adminWebAuthorizationUrl);
    config.get.withArgs("adminWeb.login_url").returns(loginUrl);
    config.get.withArgs("idam.oauth2.client_id").returns(clientId);

    filter = proxyquire("../../main/role/admin-web-role-authorizer-filter", {
      config,
    }).adminWebRoleAuthorizerFilter;
  });

  describe("when filter is called", () => {
    beforeEach(() => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
    });

    it("should call next middleware with error", (done) => {

      mock("http://adminweb")
        .get("/authorize")
        .reply(500, {});

      filter(req, res, (error) => {
        try {
          debug("error", error);
          expect(error).not.to.be.undefined;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should call next middleware without error", (done) => {

      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      mock("http://adminweb")
        .get("/authorize")
        .reply(200, authorization);

      filter(req, res, (error) => {
        try {
          debug("***** req", req.adminWebAuthorization);
          expect(error).to.be.undefined;
          expect(req.adminWebAuthorization).not.to.be.undefined;
          expect(JSON.stringify(req.adminWebAuthorization)).to.be.equal(JSON.stringify(authorization));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
