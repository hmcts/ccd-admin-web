import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteRole(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userrole_url");  // "userrole_url: http://localhost:4451/api/user-role"

    const headers = {
        Accept: "application/json",
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };
    return request
        .delete(url)
        .query({ role: req.body.role })
        .set("Content-Type", "application/json")
        .set(headers)
        .then((res) => {
            logger.info(`Delete role: ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error deleting role: ${error.response.text}`);
                logger.error(`**** JCDEBUG: response = ` + error.response);
                // url = http://ccd-definition-store-api-aat.service.core-compute-aat.internal/api/user-role
                logger.error(`**** JCDEBUG: url = ` + url);
                logger.error(`**** JCDEBUG: role = ` + req.body.role);
                throw error;
            } else {
                const errMsg = "Error deleting role: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
