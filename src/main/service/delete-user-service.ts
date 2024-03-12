import * as request from "superagent";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export function deleteUserProfile(req) {
    const logger = Logger.getLogger(__filename);
    const url = config.get("adminWeb.userprofiles_url");

    logger.info(`**** JCDEBUG: delete-user-service`);
    const stringifyCircularJSON = (obj) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (k, v) => {
        if (v !== null && typeof v === "object") {
          if (seen.has(v)) {
            return;
          }
          seen.add(v);
        }
        return v;
      });
    };
    logger.info(`**** JCDEBUG: delete-user-service: req = ` + stringifyCircularJSON(req));

    const headers = {
        Accept: "application/json",
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };
    return request
        .delete(url)
        .query({ uid: req.body.idamId, jid: req.session.jurisdiction })
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
