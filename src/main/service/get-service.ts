import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetch(req, url: any, query?: object) {
    const logger = Logger.getLogger(__filename);
    const headers = {
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };

    logger.info("get-service.ts !!!!!!");
    logger.info("headers.Authorization !!!!!! " +  headers.Authorization);
    logger.info("headers.ServiceAuthorization !!!!!! " + headers.ServiceAuthorization);
    logger.info("query ------ !!!!!! " + query);
    logger.info("method!!" + req.method);
    logger.info("headers!!" + req.headers);

    for ( const property in req.headers) {
      if (req.headers.hasOwnProperty(property)) {
        logger.info(property + ": VALUE " + req.headers[property]);
      }
  }

    logger.info("req url!!!" + req.url);
    logger.info("url!!! fin" + url);

    return request
        .get(url)
        .query(query)
        .set(headers)
        .then((res) => {
            logger.debug(`Get data, response: ${res.text}`);
            return res.text;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error retrieving data: ${error.response}`);
                logger.error(`Error retrieving data: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error retrieving data: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
