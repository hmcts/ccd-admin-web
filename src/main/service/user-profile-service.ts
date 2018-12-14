import * as config from "config";
import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetchUserProfilesByJurisdiction(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userprofiles_url");
    const headers = {
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
        actionedBy : req.authentication.user.email,
    };
    const jurisdiction = req.body.jurisdictionName ? req.body.jurisdictionName : req.session.jurisdiction;
    const query = jurisdiction ? { jurisdiction: `${jurisdiction}` } : {};
    logger.info(`Userprofile jurisdiction: ${ JSON.stringify(query) }`);
    return request
        .get(url)
        .query(query)
        .set(headers)
        .then((res) => {
            logger.debug(`Get user profiles by jurisdiction, response: ${res.text}`);
            return res.text;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error retrieving user profiles by jurisdiction: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error retrieving user profiles: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
