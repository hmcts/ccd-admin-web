import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetch(req, url: any, query?: object) {
    const logger = Logger.getLogger(__filename);
    const headers = {
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
        actionedBy : req.authentication.user.email,
    };

    logger.info(`Fetch query parameter: ${ JSON.stringify(query) }`);
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
