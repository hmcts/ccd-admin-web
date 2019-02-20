import Debug from "debug";

const debug = Debug("ccd-admin-web:whitelist-roles-authorizer");

export const isUserAuthorized = (roles, whitelist) => {
  debug(`Roles whitelist: ${whitelist}`);

  const whitelisted = [].concat.apply(roles.filter((r) => whitelist.some((w) => r.match(w))));
  debug(`User's whitelisted roles: ${whitelisted}`);

  return whitelisted.length > 0;
};
