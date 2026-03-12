import Debug from "debug";
import config from "config";
import { isUserAuthorized as checkUserRoles } from "./whitelist-roles-authorizer";

const debug = Debug("ccd-admin-web:roles-based-authorizer");

const whitelist: string [] = config.has("security.roles_whitelist") ? config.get<string>("security.roles_whitelist").split(",") : [];

export const isUserAuthorized = (user) => {
  const authorized = checkUserRoles(user.roles, whitelist);
  debug(`User roles authorized: ${authorized}`);
  return authorized;
};
