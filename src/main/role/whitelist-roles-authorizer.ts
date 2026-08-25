import Debug from "debug";

const debug = Debug("ccd-admin-web:whitelist-roles-authorizer");

export const isUserAuthorized = (roles, whitelist) => {
  debug(`Roles whitelist: ${whitelist}`);

  const whitelisted = roles.filter((r) => whitelist.some((w) => r.match(w))).concat();
  debug(`User's whitelisted roles: ${whitelisted}`);

  return whitelisted.length > 0;
};
