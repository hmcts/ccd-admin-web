import * as chai from "chai";
import { appTestWithAuthorizedAdminWebRoles } from "../../main/app.test-admin-web-roles-authorized";
import { JSDOM } from "jsdom";
import * as sinonChai from "sinon-chai";
import { app } from "../../main/app";
import * as mock from "nock";
import * as request from "supertest";
import * as sinon from "sinon";
import * as reindexTaskService from "../../main/service/reindex-task-service";
import { get } from "config";

const expect = chai.expect;
chai.use(sinonChai);

describe("test route Reindex Tasks", () => {
    let getReindexTasksStub: sinon.SinonStub;

    beforeEach(() => {
        mock.cleanAll();
        getReindexTasksStub = sinon.stub(reindexTaskService, "getReindexTasks");
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should redirect to IdAM login page when not authenticated", () => {
        return request(app)
        .get("/reindex")
        .then((res) => {
            expect(res.statusCode).to.equal(302);
            expect(res.headers.location.startsWith(get("adminWeb.login_url"))).to.be.true;
        });
    });

    it("should return the reindex page with all tasks when no caseType query param is provided", async () => {
      const mockTasks = [
        {
          caseType: "CaseTypeA",
          deleteOldIndex: "false",
          endTime: "2025-10-30T14:10:46.277Z",
          exceptionMessage: "",
          indexName: "casetypea_cases-000002",
          jurisdiction: "JUR",
          startTime: "2025-10-30T14:00:40.448Z",
          status: "SUCCESS",
        },
        {
          caseType: "CaseTypeB",
          deleteOldIndex: "true",
          endTime: "2025-10-30T14:15:12.005Z",
          exceptionMessage: "Exception: failed shard update",
          indexName: "casetypeb_cases-000003",
          jurisdiction: "JUR2",
          startTime: "2025-10-30T14:05:59.102Z",
          status: "FAILED",
        },
      ];

      getReindexTasksStub.onFirstCall().resolves(mockTasks);
      getReindexTasksStub.onSecondCall().resolves(mockTasks);

      return request(appTestWithAuthorizedAdminWebRoles)
        .get("/reindex")
        .set("Cookie", "accessToken=ey123.ey456")
        .then((res) => {
            expect(res.statusCode).to.equal(200);
            const dom = new JSDOM(res.text);
            const pageHeading = dom.window.document.querySelector(".heading-large");
            expect(pageHeading?.textContent).to.include("Reindex");

            const textContent = dom.window.document.body.textContent;
            expect(textContent).to.include("CaseTypeA");
            expect(textContent).to.include("CaseTypeB");
        });
  });

    it("should render filtered tasks when caseType query is selected", async () => {
      const allTasks = [
        { caseType: "CaseTypeA", startTime: "2025-10-30T14:00:00Z", endTime: "2025-10-30T14:10:00Z" },
        { caseType: "CaseTypeB", startTime: "2025-10-30T14:05:00Z", endTime: "2025-10-30T14:15:00Z" },
      ];
      const filteredTasks = [allTasks[1]];

      getReindexTasksStub.onFirstCall().resolves(allTasks);
      getReindexTasksStub.onSecondCall().resolves(filteredTasks);

      return request(appTestWithAuthorizedAdminWebRoles)
      .get("/reindex?caseType=CaseTypeA")
      .set("Cookie", "accessToken=ey123.ey456")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        const dom = new JSDOM(res.text);
        const select = dom.window.document.querySelector("#caseType");
        expect(select).to.exist;

        const selectedOption = dom.window.document.querySelector("option[selected]");
        expect(selectedOption?.getAttribute("value")).to.equal("CaseTypeA");

        const bodyText = dom.window.document.body.textContent;
        expect(bodyText).to.include("CaseTypeB");

        expect(getReindexTasksStub).to.have.been.calledTwice;
        expect(getReindexTasksStub.secondCall.args[1]).to.equal("CaseTypeA");
      });
    });

    it("should render an error page when the service throws", async () => {
        getReindexTasksStub.rejects(new Error("Error fetching reindex tasks (HTTP 500)"));

        return request(appTestWithAuthorizedAdminWebRoles)
        .get("/reindex")
        .then((res) => {
            expect(res.statusCode).to.equal(500);
            const dom = new JSDOM(res.text);
            const errorMessage = dom.window.document.body.textContent;
            expect(errorMessage).to.include("Error fetching reindex tasks (HTTP 500)");
        });
    });
  });
