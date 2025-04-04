import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function uploadFile(req) {
  const url = config.get("adminWeb.import_url");
  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);
  logger.info(`JCDEBUG: Uploading file ${req.file.originalname} to Case Definition Store at ${url}`);
  logger.debug(`JCDEBUG: Uploading file ${req.file.originalname} to Case Definition Store at ${url}`);
  logger.info(`JCDEBUG: Headers: ${JSON.stringify(headers)}`);
  logger.debug(`JCDEBUG: Headers: ${JSON.stringify(headers)}`);
  return request
    .post(url)
    .set(headers)
    .set("enctype", "multipart/form-data")
    .attach("file", req.file.buffer, { filename: req.file.originalname })
    .timeout(99000)
    .then((res) => {
      logger.info(`Uploaded file ${req.file.originalname} to Case Definition Store, response: ${res.text}`);
      return res;
    })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error uploading file to Case Definition Store: ${error.response.text}`);
        throw error;
      } else {
        const errMsg = "Error uploading file to Case Definition Store: no error response";
        logger.error(errMsg);
        error.text = errMsg;
        throw error;
      }
    });
}
