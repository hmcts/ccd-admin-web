import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { UserRole } from "domain/userrole";

export function createUserRole(req, userrole: UserRole) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.saveuserrole_url");

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
            logger.info(`Create user role : ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error creating/updating user role: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error creating / updating user role: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });

}
