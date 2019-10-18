import Debug from "debug";
import { get } from "config";
import { isUserAuthorized as checkUserRoles } from "./whitelist-roles-authorizer";
import { Logger } from "@hmcts/nodejs-logging";

const debug = Debug("ccd-admin-web:roles-based-authorizer");

const whitelist = get("security.roles_whitelist") ? get("security.roles_whitelist").split(",") : [];

const logger = Logger.getLogger(__filename);

export const isUserAuthorized = (user) => {
  const authorized = checkUserRoles(user.roles, whitelist);
  logger.info("user.roles:" + user.roles);
  debug(`User roles authorized: ${authorized}`);
  logger.info("authorized:" + authorized);
  return authorized;
};
