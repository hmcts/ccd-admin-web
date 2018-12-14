import * as chai from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("user profile service", () => {

  const userProfileUrl = "http://localhost:4453/users";

  let req;
  let fetchUserProfilesByJurisdiction;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      authentication: {
        user : {
          defaultService: "CCD",
          email: "irtahkm@example.com",
          forename: "ccd",
          id: 445,
          roles: [],
          surname: "test",
        },
      },
      body: { jurisdictionName: "Mike" },
      serviceAuthToken: "serviceAuthToken",
      session: {},
    };

    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("adminWeb.userprofiles_url").returns(userProfileUrl);

    fetchUserProfilesByJurisdiction = proxyquire("../../main/service/user-profile-service", {
      config,
    }).fetchUserProfilesByJurisdiction;
  });

  describe("successful user profiles retrieval", () => {
    it("should return an HTTP 200 status and success message", (done) => {
      const expectedResult = {
        user_profiles: [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }],
      };

      nock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "Mike" })
        .reply(200, expectedResult);

      fetchUserProfilesByJurisdiction(req).then((res) => {
        try {
          expect(JSON.parse(res).user_profiles.length).to.equal(1);
          expect(res).to.equal(JSON.stringify(expectedResult));
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("should return user profiles from query if jurisdictionName is not passed in the body", (done) => {
      const expectedResult = {
        user_profiles: [{
          id: "ID_3",
          work_basket_default_case_type: "Case Type 3",
          work_basket_default_jurisdiction: "Jurisdiction 3",
          work_basket_default_state: "State 3",
        }],
      };
      req = {
        accessToken: "userAuthToken",
        authentication: {
          user : {
            defaultService: "CCD",
            email: "irtahkm@example.com",
            forename: "ccd",
            id: 445,
            roles: [],
            surname: "test",
          },
        },
        body: {},
        serviceAuthToken: "serviceAuthToken",
        session: { jurisdiction: "test2" },
      };

      nock("http://localhost:4453")
        .get("/users")
        .query({ jurisdiction: "test2" })
        .reply(200, expectedResult);

      fetchUserProfilesByJurisdiction(req).then((res) => {
        try {
          expect(JSON.parse(res).user_profiles.length).to.equal(1);
          expect(res).to.equal(JSON.stringify(expectedResult));
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe("invalid S2S token", () => {
      it("should return an HTTP 403 status and error message", (done) => {
        req.serviceAuthToken = "invalid_token";

        const expectedResult = {
          error: "Forbidden",
          message: "Access Denied",
        };

        nock("http://localhost:4453")
          .get("/users")
          .query({ jurisdiction: "Mike" })
          .reply(403, expectedResult);

        fetchUserProfilesByJurisdiction(req).catch((err) => {
          try {
            expect(err.status).to.equal(403);
            expect(err.response.body.error).to.equal(expectedResult.error);
            expect(err.response.body.message).to.equal(expectedResult.message);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
});
