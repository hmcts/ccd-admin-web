import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { UserProfile } from "domain/userprofile";

export function createUserProfile(req, userprofile: UserProfile) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.create_user_profile_url");

    const headers = {
        Accept: "application/json",
        Authorization: req.headers.Authorization ? req.headers.Authorization : req.headers.authorization,
        ServiceAuthorization: req.headers.ServiceAuthorization ? req.headers.ServiceAuthorization :
            req.headers.serviceauthorization,
    };

    if (!validateEmail(userprofile.id)) {
        return Promise.reject(new Error("Invalid Email address"));
    }
    const payloadString: string = `[{"id": "${userprofile.id}", ` +
        `"jurisdictions": [{ "id": "${userprofile.jurisdictionname}"}], ` +
        `"work_basket_default_jurisdiction": "${userprofile.jurisdictionname}",` +
        `"work_basket_default_case_type": "${userprofile.caseType}",` +
        ` "work_basket_default_state": "${userprofile.state}" }]`;

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

    function validateEmail(email) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    }

}
