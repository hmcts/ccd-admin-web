
import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function fetchUserProfilesByJurisdiction(req) {
        const logger = Logger.getLogger(__filename);
        const url = config.get("adminWeb.userprofiles_url");
        const headers = {
                Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
                ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
                        req.headers.serviceauthorization,
        };
        const query = req.body.jurisdictionName ? { jurisdiction: `${req.body.jurisdictionName}` } : {};
        return request
                .get(url)
                .query(query)
                .set(headers)
                .then((res) => {
                        logger.info(`Get user profiles by jurisdiction, response: ${res.text}`);
                        return res.text;
                })
                .catch((error) => {
                        if (error.response) {
                                logger.error(`Error retrieving user profiles by jurisdiction: ${error.response.text}`);
                                throw error;
                        } else {
                                const errMsg = "Error retrieving user profiles no error response";
                                logger.error(errMsg);
                                error.text = errMsg;
                                throw error;
                        }
                });

}
