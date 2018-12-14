import * as config from "config";
import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";
import { Definition } from "../domain/definition";

export function createDefinition(req, definition: Definition) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.createdefinition_url");

    const headers = {
        "Accept": "application/json",
        "Authorization": req.accessToken,
        "Content-Type": "application/json",
        "ServiceAuthorization": req.serviceAuthToken,
        "actionedBy" : req.authentication.user.email,
    };

    const payloadString: string =
        `{ "jurisdiction": {` +
            `"id": "${definition.jurisdictionId}" },` +
        `"description": "${definition.description}",` +
        `"data": { ${definition.data} },` +
        `"author": "${definition.author}",` +
        `"deleted": "false" }`; // Temporary workaround; should default in Definition model object, ccd-definition-store

    return request
        .post(url)
        .set(headers)
        .send(payloadString)
        .then((res) => {
            logger.info(`Created definition: ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error creating definition: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error creating definition: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
