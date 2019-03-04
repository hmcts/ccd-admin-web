// import { app } from "../../main/app";
import { expect } from "chai";
import Debug from "debug";
import * as idamServiceMock from "../http-mocks/idam";
import * as mock from "nock";
import * as proxyquire from "proxyquire";
// import * as request from "supertest";
import * as sinon from "sinon";

describe("admin-web-role-authorizer-filter", () => {

  const adminWebAuthorizationUrl = "http://adminweb/authorize";
  const authorization = {canDance: true, canDrink: false};
  const CCD_IMPORT_ROLE = "ccd-import";
  const loginUrl = "http://idam.login";
  const clientId = "ccd_admin";
  let filter;
  // let authCheckerUserOnlyfilter;
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

    // authCheckerUserOnlyfilter = proxyquire("../../main/user/auth-checker-user-only-filter", {
    //   "./user-request-authorizer": userRequestAuthorizer,
    //   config,
    // }).authCheckerUserOnlyFilter;

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

      mock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, authorization);

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

      // return request(app)
      //   .addFi
      //   .get("/createuser")
      //   .set("Cookie", "accessToken=ey123.ey456")
      //   .then((resp) => {
      //     expect(resp.statusCode).to.equal(200);
      //     // expect(res.text).to.contain("Jurisdiction 1");
      //     // expect(res.text).to.contain("Jurisdiction 2");
      //   });

      // appTestWithAuthroziedAdminWebRoles.use((req, res, next) => {
      //   req.accessToken = "userAuthToken";
      //   req.authentication = {
      //     user: {
      //       email: "ccd@hmcts.net",
      //       id: 123,
      //     },
      //   };
      //   req.adminWebAuthorization = {
      //     canManageUserProfile: true,
      //   };
      //   req.serviceAuthToken = "serviceAuthToken";
      //   next();
      // });
      filter(req, res, (error) => {
        // req.accessToken = "userAuthToken";
        // req.authentication = {
        //   user: {
        //     email: "ccd@hmcts.net",
        //     id: 123,
        //   },
        // };
        // req.serviceAuthToken = "serviceAuthToken";

        try {
          // debug("error", error);
          debug("res", res);
          // debug("req", req);
          expect(error).to.be.undefined;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
