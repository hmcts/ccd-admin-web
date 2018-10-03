import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { UserRole } from "domain/userrole";

export function updateUserRole(req, userrole: UserRole) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userrole_url");

    const headers = {
        Accept: "application/json",
        Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
        ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
            req.headers.serviceauthorization,
    };

    const payloadString: string = `{"role": "${userrole.role}", ` +
        ` "security_classification": "${userrole.classification}" }`;

    return request
        .put(url)
        .set("Content-Type", "application/json")
        .set(headers)
        .send(payloadString)
        .then((res) => {
            logger.info(`Update user role : ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error updating user role: ${error.response.text}`);
                const errorResponse = JSON.parse(error.response.text);
                error.rawResponse = errorResponse.message;
                throw error;
            } else {
                const errMsg = "Error updating user role: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });

}
