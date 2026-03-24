import request from "superagent";
import config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteUserProfile(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get<string>("adminWeb.userprofiles_url");

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
            logger.info(`Deleted user profile: ${req.body.idamId}`);
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
