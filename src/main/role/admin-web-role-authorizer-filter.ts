import * as config from "config";
import Debug from "debug";
import { fetch } from "../service/get-service";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger(__filename);
const url = config.get("adminWeb.authorization_url");

export const adminWebRoleAuthorizerFilter = (req, res, next) => {

  const debug = Debug("ccd-admin-web:admin-web-role-authorizer-filter");
  req.adminWebAuthorization = {};

  fetch(req, url).then((response) => {
    logger.info(response);
    debug("response", response);
    req.adminWebAuthorization = JSON.parse(response);
    debug("req.adminWebAuthorization", req.adminWebAuthorization);
    next();
  }).catch((error) => {
    next(error);
  });

};
