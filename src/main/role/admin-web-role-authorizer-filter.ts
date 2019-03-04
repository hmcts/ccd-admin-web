import * as config from "config";
import { fetch } from "../service/get-service";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger(__filename);
const url = config.get("adminWeb.authorization_url");

export const adminWebRoleAuthorizerFilter = (req, res, next) => {

  req.adminWebAuthorization = {};

  fetch(req, url).then((response) => {
    logger.debug(response);
    req.adminWebAuthorization = JSON.parse(response);
    next();
  }).catch((error) => {
    next(error);
  });

};
