import Debug from "debug";
import { isUserAuthorized as checkUserRoles } from "./whitelist-roles-authorizer";

const debug = Debug("ccd-admin-web:roles-based-authorizer");

export const isUserAuthorized = (user, whitelist) => {
  const authorized = checkUserRoles(user.roles, whitelist);
  debug(`User roles authorized: ${authorized}`);
  return authorized;
};
