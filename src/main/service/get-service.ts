import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetch(req, url: any) {
        const logger = Logger.getLogger(__filename);
        // const url = config.get("adminWeb.alluserroles_url");
        const headers = {
                Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
                ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
                        req.headers.serviceauthorization,
        };

        return request
                .get(url)
                .set(headers)
                .then((res) => {
                        logger.info(`Get data, response: ${res.text}`);

                        return res.text;
                })
                .catch((error) => {
                        if (error.response) {
                                logger.error(`Error retrieving data: ${error.response.text}`);
                                throw error;
                        } else {
                                const errMsg = "Error retrieving data no error response";
                                logger.error(errMsg);
                                error.text = errMsg;
                                throw error;
                        }
                });

}
