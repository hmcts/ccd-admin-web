import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteDefinition(req) {
  const logger = Logger.getLogger(__filename);
  const url = config.get("adminWeb.deletedefinition_url");

  const headers = {
    Accept: "application/json",
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  return request
    .delete(`${url}/${req.body.jurisdictionId}/${req.body.definitionVersion}`)
    .set("Content-Type", "application/json")
    .set(headers)
    .then((res) => {
      logger.info(`Delete Definition: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error deleting Definition: ${error.response.text}`);
        throw error;
      } else {
        const errMsg = "Error deleting Definition: no error response";
        logger.error(errMsg);
        error.text = errMsg;
        throw error;
      }
    });
}
