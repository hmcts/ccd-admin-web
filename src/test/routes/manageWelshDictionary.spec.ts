import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as nock from "nock";
import * as request from "supertest";

describe("test route manage Welsh Dictionary", () => {

  describe("on POST /manageWelshDictionary", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    beforeEach(() => {
      nock.cleanAll();
    });

    it("should respond with No file selected error when authenticated and authorized", () => {
      it("should return Entry page when authenticated and authorized", () => {
        idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
        idamServiceMock.resolveRetrieveServiceToken();

        const req = {
          accessToken: "userAuthToken",
          serviceAuthToken: "serviceAuthToken",
        };

        nock("http://localhost:4451")
            .get("/api/idam/adminweb/authorization")
            .reply(200, {});

        // tslint:disable-next-line:prefer-const
        let res;
        // tslint:disable-next-line:prefer-const
        let next;
        return request(appTestWithAuthorizedAdminWebRoles)
            .post("/manageWelshDictionary")
            .send({ req, res, next })
            .set("Cookie", "accessToken=ey123.ey456")
            // tslint:disable-next-line:no-shadowed-variable
            .then((res) => {
              expect(res.statusCode).to.equal(302);
            });
      });
    });

    it("should respond with Not CSV error when authenticated and authorized", () => {
      it("should return Entry page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      const req = {
        accessToken: "userAuthToken",
        file: {
          buffer: new Buffer(8),
          originalname: "dummy_filename.xslx",
        },
        serviceAuthToken: "serviceAuthToken",
      };

      nock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

        // tslint:disable-next-line:prefer-const
      let res;
        // tslint:disable-next-line:prefer-const
      let next;
      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/manageWelshDictionary")
        .send({ req, res, next })
        .set("Cookie", "accessToken=ey123.ey456")
          // tslint:disable-next-line:no-shadowed-variable
        .then((res) => {
          expect(res.statusCode).to.equal(400);
        });
      });
    });

    it("should respond with Welsh Translation response when authenticated and authorized", () => {
      it("should return Confirm Delete Definition page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();
      const req = {
        accessToken: "userAuthToken",
        file: {
          buffer: new Buffer(8),
          originalname: "dummy_filename.csv",
        },
        serviceAuthToken: "serviceAuthToken",
      };
      nock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

        // tslint:disable-next-line:prefer-const
      let res;
        // tslint:disable-next-line:prefer-const
      let next;
      return request(appTestWithAuthorizedAdminWebRoles)
        .post("/manageWelshDictionary")
        .send({ req, res, next })
        .set("Cookie", "accessToken=ey123.ey456")
          // tslint:disable-next-line:no-shadowed-variable
        .then((res) => {
          expect(res.statusCode).to.equal(200);
        });
      });
    });

  });

  describe("on GET /manageWelshDictionary", () => {
    const CCD_IMPORT_ROLE = "ccd-import";

    beforeEach(() => {
      nock.cleanAll();
    });

    it("should respond with Welsh Translation csvfile response when authenticated and authorized", () => {
      it("should return Confirm Delete Definition page when authenticated and authorized", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      nock("http://localhost:4451")
        .get("/api/idam/adminweb/authorization")
        .reply(200, {});

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/manageWelshDictionary")
        .send({
          currentJurisdiction: "TEST", description: "Test draft", version: 1,
        })
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res: { statusCode: any; }) => {
          expect(res.statusCode).to.equal(200);
        });
      });
    });
  });
});
