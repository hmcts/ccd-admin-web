import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteRole(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userrole_url");

    logger.info(`**** JCDEBUG: delete-role-service`);
    const mystringify = require("json-stringify-safe");
    logger.info(`**** JCDEBUG: delete-role-service: req = ` + mystringify(req));

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
            logger.error(`**** JCDEBUG: delete-role-service: url = ` + url);
            if (error.response) {
                logger.error(`Error deleting role: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error deleting role: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
