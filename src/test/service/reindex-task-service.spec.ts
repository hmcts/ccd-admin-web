import * as chai from "chai";
import * as nock from "nock";
import * as sinonChai from "sinon-chai";
import { getReindexTasks } from "../../main/service/reindex-task-service";

const expect = chai.expect;
chai.use(sinonChai);

describe("Reindex task service", () => {

  const definitionStoreHost = "http://localhost:4451";
  const reindexEndpoint = "/elastic-support/reindex/tasks";

  let req;

  beforeEach(() => {
    req = {
      accessToken: "userAuthToken",
      serviceAuthToken: "serviceAuthToken",
      authentication: {},
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("successful data retrieval", () => {
    it("should return an HTTP 200 status and reindex task list", async () => {
      const expectedResult = [
        {
          caseType: "FT_CRUD",
          jurisdiction: "BEFTA_MASTER",
          indexName: "ft_crud_cases-000001",
          status: "SUCCESS",
        },
        {
          caseType: "FT_Complex",
          jurisdiction: "BEFTA_MASTER",
          indexName: "ft_complex_cases-000001",
          status: "FAILED",
        },
      ];

      nock(definitionStoreHost)
        .get(reindexEndpoint)
        .reply(200, expectedResult);

      const result = await getReindexTasks(req);
      expect(result.length).to.equal(2);
      expect(result[0].caseType).to.equal("FT_CRUD");
    });

    it("should return filtered tasks when caseType parameter is provided", async () => {
      const caseType = "FT_CRUD";
      const expectedResult = [
        {
          caseType: "FT_CRUD",
          jurisdiction: "BEFTA_MASTER",
          indexName: "ft_crud_cases-000001",
          status: "SUCCESS",
        },
      ];

      nock(definitionStoreHost)
        .get(`${reindexEndpoint}?caseType=${caseType}`)
        .reply(200, expectedResult);

      const result = await getReindexTasks(req, caseType);
      expect(result.length).to.equal(1);
      expect(result[0].caseType).to.equal(caseType);
    });
  });

    it("should throw an error when the service is unavailable", async () => {
      nock(definitionStoreHost)
        .get(reindexEndpoint)
        .reply(500, "Internal Server Error");

      try {
        await getReindexTasks(req);
        throw new Error("Expected error was not thrown");
      } catch (err: any) {
        expect(err.message).to.include("HTTP 500");
      }
    });

    it("should handle connection errors gracefully", async () => {
      // no nock() here -> causes ECONNREFUSED
      try {
        await getReindexTasks(req);
        throw new Error("Expected connection error was not thrown");
      } catch (err: any) {
        expect(err.message).to.include("no HTTP response");
      }
    });
  });
