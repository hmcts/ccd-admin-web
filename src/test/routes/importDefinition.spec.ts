import { app } from "../../main/app";
import { expect } from "chai";
import { get } from "config";
import * as idamServiceMock from "../http-mocks/idam";
import { JSDOM } from "jsdom";
import * as mock from "nock";
import * as request from "supertest";

describe("Import Definition page", () => {
  const CCD_IMPORT_ROLE = "ccd-import";

  beforeEach(() => {
    mock.cleanAll();
  });

  describe("on GET /import", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .get("/import")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should return Import Case Definition page when authenticated", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .reply(200, [{
          caseType: "I am 100% happy with this piece of work",
          case_type: "I am si of it",
          dateImported: "last century",
          date_imported: "next century",
          fileName: "x343EWFMVl",
          filename: "9343EWFMVl",
          whoImported: "xID_3",
          who_imported: "ID_3"}]);

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.contain("<th>Date Imported</th>");
          expect(res.text).to.contain("<th>Who Imported</th>");
          expect(res.text).to.contain("<th>Case Type</th>");
          expect(res.text).to.contain("<th>Filename</th>");
          expect(res.text).to.contain("next century");
          expect(res.text).to.contain("ID_3");
          expect(res.text).to.contain("I am si of it");
          expect(res.text).to.contain("9343EWFMVl");
          expect(res.text).not.to.contain("last century");
          expect(res.text).not.to.contain("xID_3");
          expect(res.text).not.to.contain("I am 100% happy with this piece of work");
          expect(res.text).not.to.contain("x343EWFMVl");
        });
    });

    it("should return a back-end error status", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451")
        .get("/api/import-audits")
        .replyWithError(500);

      return request(app)
        .get("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(500);
        });
    });
  });

  describe("on POST /import", () => {

    it("should redirect to IdAM login page when not authenticated", () => {
      return request(app)
        .post("/import")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should upload a valid Definition file when authenticated", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      mock("http://localhost:4451/import")
        .post("")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(201);
          const dom = new JSDOM(res.text);
          const result = dom.window.document.querySelector(".form-group").innerHTML;
          expect(result).to.contain("Definition imported");
        });
    });

    it("should redirect to Import Definition page without calling back-end if the file is not an Excel file", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      const apiCall = mock("http://localhost:4451/import")
        .post("")
        .reply(201, "Definition imported");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.txt",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should redirect to Import Definition page without calling back-end if no file is present on request", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      const apiCall = mock("http://localhost:4451/import")
        .post("")
        .reply(201, "Definition imported");

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is not called
          expect(apiCall.isDone()).to.be.false;
        });
    });

    it("should redirect to Import Definition page if there is a back-end error", () => {
      idamServiceMock.resolveRetrieveUserFor("1", CCD_IMPORT_ROLE);
      idamServiceMock.resolveRetrieveServiceToken();

      const apiCall = mock("http://localhost:4451/import")
        .post("")
        .replyWithError(500, "Error on Definition import");

      const file = {
        buffer: new Buffer(8),
        originalname: "dummy_filename.xlsx",
      };

      return request(app)
        .post("/import")
        .set("Cookie", "accessToken=ey123.ey456")
        .attach("file", file.buffer, file.originalname)
        .then((res) => {
          expect(res.statusCode).to.equal(302);
          expect(res.headers.location).to.equal("/import");

          // Assert that the back-end is called
          expect(apiCall.isDone()).to.be.true;
        });
    });
  });
});
