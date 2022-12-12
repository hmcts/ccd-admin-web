import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteUserProfile(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userprofiles_url");

    logger.info("JCDEBUG: deleteUserProfile: url: " + url);
    logger.info("JCDEBUG: deleteUserProfile: accessToken: " + req.accessToken);
    logger.info("JCDEBUG: deleteUserProfile: serviceAuthToken: " + req.serviceAuthToken);
    logger.info("JCDEBUG: deleteUserProfile: jurisdictionId: " + req.body.jurisdictionId);
    logger.info("JCDEBUG: deleteUserProfile: definitionVersion: " + req.body.definitionVersion);

    const headers = {
        Accept: "application/json",
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };
    return request
        .delete(url)
        .query({ uid: req.body.idamId, jid: req.session.jurisdiction })
        .set("Content-Type", "application/json")
        .set(headers)
        .then((res) => {
            logger.info(`Delete user profile : ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error deleting user profile: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error deleting user profile: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
