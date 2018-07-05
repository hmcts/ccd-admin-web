import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function fetchAll(req) {
  const logger = Logger.getLogger(__filename);
  const url = config.get("adminWeb.jurisdiction_url");
  const headers = {
    Authorization: req.headers.Authorization,
    ServiceAuthorization: req.headers.ServiceAuthorization,
  };

  return request
    .get(url)
    .set(headers)
    .then((res) => {
      logger.info(`Get All jurisdictions, response: ${res.text}`);
      return res.text;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error retriving jurisdiction: ${error.response.text}`);
        throw error;
      } else {
        const errMsg = "Error jurisdictions no error response";
        logger.error(errMsg);
        error.text = errMsg;
        throw error;
      }
    });
}
