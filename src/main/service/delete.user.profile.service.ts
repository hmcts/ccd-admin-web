import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteUserProfile(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userprofiles_url");

    const headers = {
        Accept: "application/json",
        Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
        ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
            req.headers.serviceauthorization,
    };
    return request
        .delete(url)
        .query({ uid: req.body.idamId })
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
