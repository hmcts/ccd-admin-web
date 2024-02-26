import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";

export function getDictionary(req) {
  const url = config.get("adminWeb.welsh_translation_get_dictionary_url");
  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);

  return request
    .get(url)
    .set(headers)
    .then((res) => {
          logger.info(`Received successful response for getDictionary`);
          logger.debug(`${res.text}`);
          return res;
        })
    .catch((error) => {
      if (error.response) {
        logger.error(`Error retrieving dictionary from TS Translation Service: ${error.response.text}`);
      }
      throw error;
    });
}
