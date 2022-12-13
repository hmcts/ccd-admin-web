import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteDefinition(req) {
  const logger = Logger.getLogger(__filename);
  const url = config.get("adminWeb.deletedefinition_url");

    logger.info("JCDEBUG: deleteDefinition: url: " + url + " , "
        + "accessToken: " + req.accessToken + " , "
        + "serviceAuthToken: " + req.serviceAuthToken + " , "
        + "jurisdictionId: " + req.body.jurisdictionId + " , "
        + "definitionVersion: " + req.body.definitionVersion);

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
      logger.info(`JCDEBUG 1: deleteDefinition: Delete Definition: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`JCDEBUG 2: deleteDefinition: Error deleting Definition: ${error.response.text}`);
        throw error;
      } else {
        const errMsg = "JCDEBUG 3: deleteDefinition: Error deleting Definition: no error response";
        logger.error(errMsg);
        error.text = errMsg;
        throw error;
      }
    });
}
