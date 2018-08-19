import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { UserProfile } from "domain/userprofile";

export function createUserProfile(req, userprofile: UserProfile) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.saveuserprofiles_url");

    const headers = {
        Accept: "application/json",
        Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
        ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
            req.headers.serviceauthorization,
    };

    const payloadString: string = `{"id": "${userprofile.id}", ` +
        `"jurisdictions": [{ "id": "${userprofile.currentJurisdiction}"}], ` +
        `"work_basket_default_jurisdiction": "${userprofile.jurisdictionname}",` +
        `"work_basket_default_case_type": "${userprofile.caseType}",` +
        ` "work_basket_default_state": "${userprofile.state}" }`;

    return request
        .put(url)
        .set("Content-Type", "application/json")
        .set(headers)
        .send(payloadString)
        .then((res) => {
            logger.info(`Create user profile : ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error creating/updating user profile: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error creating/ user profile: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
