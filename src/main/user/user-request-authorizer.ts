import { getTokenDetails } from "./user-resolver";
import { isUserAuthorized } from "../role/roles-based-authorizer";
import { Logger } from "@hmcts/nodejs-logging";

export const ERROR_TOKEN_MISSING = {
  error: "Bearer token missing",
  message: "You are not authorised to access this resource",
  status: 401,
};
export const ERROR_UNAUTHORIZED_ROLE = {
  error: "Unauthorised role",
  message: "You are not authorised to access this resource",
  status: 403,
};
export const ERROR_UNAUTHORIZED_USER_ID = {
  error: "Unauthorised user",
  message: "You are not authorised to access this resource",
  status: 403,
};

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const AUTHORIZATION = "Authorization";

const logger = Logger.getLogger(__filename);

const authorizeRoles = (user) => new Promise((resolve, reject) => {
  if (!isUserAuthorized(user)) {
    reject(ERROR_UNAUTHORIZED_ROLE);
  } else {
    resolve();
  }
});

export const authorize = (request) => {
  logger.info("inside user-request-authorizer ");
  logger.info("authorization header: " + request.get(AUTHORIZATION));

  let user;
  const bearerToken = request.get(AUTHORIZATION) || (request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null);
  if (!bearerToken) {
    logger.info("inside the if ready to do promise ");
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  logger.info("bearer token: " + bearerToken);

  request.accessToken = bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken;

  return getTokenDetails(bearerToken)
    .then((tokenDetails) => user = tokenDetails)
    .then(() => authorizeRoles(user))
    .then(() => user);
};
