import Debug from "debug";
import { get } from "config";
import { isUserAuthorized as checkUserRoles } from "./whitelist-roles-authorizer";
import {AUTHORIZATION} from "../user/user-request-authorizer";

const debug = Debug("ccd-admin-web:roles-based-authorizer");

const whitelist = get("security.roles_whitelist") ? get("security.roles_whitelist").split(",") : [];

export const isUserAuthorized = (user) => {
  const authorized = checkUserRoles(user.roles, whitelist);
  console.log('user.roles: ' + user.roles);
  debug(`User roles authorized: ${authorized}`);
  console.log('authorized: ' + authorized);
  return authorized;
};
