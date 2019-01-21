import * as config from "config";
import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";
import { Definition } from "../domain/definition";

export function createDefinition(req, definition: Definition) {
    const logger = Logger.getLogger(__filename);
    let url = config.get("adminWeb.createdefinition_url");

    if (req.body.update) {
        url = config.get("adminWeb.updatedefinition_url");
    }

    const headers = {
        "Accept": "application/json",
        "Authorization": req.accessToken,
        "Content-Type": "application/json",
        "ServiceAuthorization": req.serviceAuthToken,
    };

    const payload = {
      author: definition.author,
      case_types: definition.caseTypes,
      data: definition.data,
      deleted: false, // Temporary workaround; should default in Definition model object, ccd-definition-store
      description: definition.description,
      jurisdiction: {
        id: definition.jurisdictionId,
      },
      status: definition.status ? definition.status : undefined,
      version: definition.version,
    };

    const createRequest = req.body.update ? request.put(url) : request.post(url);

    return createRequest
        .set(headers)
        .send(payload)
        .then((res) => {
            logger.info(req.body.update ? `Updated definition: ${res.text}` : `Created definition: ${res.text}`);
            return res;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error creating/updating definition: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error creating/updating definition: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
