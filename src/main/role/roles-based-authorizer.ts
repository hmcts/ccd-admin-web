import Debug from "debug";
import { get } from "config";
import { isUserAuthorized as checkUserRoles } from "./whitelist-roles-authorizer";

const debug = Debug("ccd-admin-web:roles-based-authorizer");

const whitelist = get("security.roles_whitelist") ? get("security.roles_whitelist").split(",") : [];

export const isUserAuthorized = (user) => {
  const authorized = checkUserRoles(user.roles, whitelist);
  debug(`User roles authorized: ${authorized}`);
  return authorized;
};
