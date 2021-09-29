import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function createGlobalSearchIndex(req) {
  const logger = Logger.getLogger(__filename);
  const url = config.get("adminWeb.global_search_index_url");

  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };

  return request
    .post(url)
    .set(headers)
    .then((res) => {
      logger.info(`Create Global Search Indices, response: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error creating Global Search Indices: ${error.response.text}`);
      }
      throw error;
    });
}
