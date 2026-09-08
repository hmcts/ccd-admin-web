import * as config from "config";
import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger(__filename);

export function getReindexTasks(req, caseType?: string, page?: number, size?: number) {
  const url = new URL(config.get("adminWeb.reindex_tasks_url"));
  if (caseType) {
    url.searchParams.set("caseType", caseType);
  }
  if (typeof page === "number") {
    url.searchParams.set("page", String(page));
  }
  if (typeof size === "number") {
    url.searchParams.set("size", String(size));
  }

  const headers = {
    Accept: "application/json",
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };

  return request
  .get(url.toString())
  .set(headers)
  .then((res) => {
      logger.info(`Received successful response: ${res.text}`);
      return res.body;
      })
  .catch((error) => {
    logger.error("Error : " + error);
    if (error.response) {
      const status = error.status || error.response.status;
      const message = error.response.text || "No response text";
      logger.error(`Error fetching reindex tasks (HTTP ${status}): ${message}`);
      throw new Error(`Reindex fetch failed with HTTP ${status}: ${message}`);
    } else {
      logger.error("Error fetching reindex tasks: no response received");
      throw new Error("Reindex fetch failed: no HTTP response");
    }
  });
}
