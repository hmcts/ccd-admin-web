import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function createElasticIndices(req) {
  const url = config.get("adminWeb.elastic_index_url");
  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);
  return request
    .post(url)
    .set(headers)
    .set("enctype", "multipart/form-data")
    .then((res) => {
      logger.info(`Create Elasticsearch indices via Case Definition Store, response: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error creating Elasticsearch indices via Case Definition Store: ${error.response.text}`);
        throw error;
      } else {
        const errMsg = "Error creating Elasticsearch indices via Case Definition Store: no error response";
        logger.error(errMsg);
        error.text = errMsg;
        throw error;
      }
    });
}
