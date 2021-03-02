import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function getCaseTypes(req) {
  const url = config.get("adminWeb.elastic_case_types_url");

  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);

  return request
    .get(url)
    .set(headers)
    .then((res) => res)
    .catch((error) => {
      if (error.response) {
        logger.error(`Error retrieving case type references from Definition Store: ${error.response.text}`);
      }
      throw error;
    });
}

export function createElasticIndex(req) {
  const url = config.get("adminWeb.elastic_index_url");
  const caseType = req.query.ctid;

  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);

  return request
    .post(url)
    .query({ctid: caseType})
    .set(headers)
    .then((res) => {
      logger.info(`Create Elasticsearch index via Case Definition Store, response: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error creating Elasticsearch index via Case Definition Store: ${error.response.text}`);
      }
      throw error;
    });
}
