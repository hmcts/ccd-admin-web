import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { UserRole } from "domain/userrole";

export function saveUserRole(req, userrole: UserRole, isCreateUserRole: boolean) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userrole_url");

    const headers = {
        Accept: "application/json",
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
        actionedBy : req.authentication.user.email,
    };

    const payloadString: string = `{"role": "${userrole.role}", ` +
        ` "security_classification": "${userrole.classification}" }`;
    let requestObject = request.put(url);
    if (isCreateUserRole) {
        requestObject = request.post(url);
    }
    return requestObject
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
