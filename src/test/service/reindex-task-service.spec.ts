import * as chai from "chai";
import * as nock from "nock";
import * as sinonChai from "sinon-chai";
import { getReindexTasks } from "../../main/service/reindex-task-service";

const expect = chai.expect;
chai.use(sinonChai);

describe("Reindex task service", () => {

  const definitionStoreHost = "http://localhost:4451";
  const reindexEndpoint = "/elastic-support/reindex/tasks";
  const expectedResult = [
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

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      authentication: {},
      serviceAuthToken: "serviceAuthToken",
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("successful data retrieval", () => {
    it("should return an HTTP 200 status and reindex task list", async () => {
      nock(definitionStoreHost)
        .get(reindexEndpoint)
        .reply(200, expectedResult);

      const result = await getReindexTasks(req);
      expect(result.length).to.equal(2);
      expect(result[0].caseType).to.equal("CaseTypeA");
    });

    it("should return filtered tasks when caseType parameter is provided", async () => {
      const caseType = "CaseTypeA";

      nock(definitionStoreHost)
        .get(`${reindexEndpoint}?caseType=${caseType}`)
        .reply(200, [expectedResult[0]]);

      const result = await getReindexTasks(req, caseType);
      expect(result.length).to.equal(1);
      expect(result[0].caseType).to.equal(caseType);
    });
  });

  describe("failed data retrieval", () => {
    it("should throw an error when the service is unavailable", async () => {
    nock(definitionStoreHost)
      .get(reindexEndpoint)
      .reply(500, "Internal Server Error");

    try {
      await getReindexTasks(req);
      throw new Error("Expected error was not thrown");
    } catch (err) {
      expect(err.message).to.include("HTTP 500");
    }
  });

    it("should handle connection errors gracefully", async () => {
      // no nock() here -> causes ECONNREFUSED
      try {
        await getReindexTasks(req);
        throw new Error("Expected connection error was not thrown");
      } catch (err) {
        expect(err.message).to.include("no HTTP response");
      }
    });
  });
});
