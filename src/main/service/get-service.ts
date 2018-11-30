import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetch(req, url: any) {
    const logger = Logger.getLogger(__filename);
    // const url = config.get("adminWeb.alluserroles_url");
    const headers = {
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };

    return request
        .get(url)
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
