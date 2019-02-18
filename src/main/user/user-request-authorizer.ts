import { getTokenDetails } from "./user-resolver";
import { isUserAuthorized } from "../role/roles-based-authorizer";

export const ERROR_TOKEN_MISSING = {
  error: "Bearer token missing",
  message: "You are not authorised to access this resource",
  status: 401,
};
export const ERROR_UNAUTHORISED_ROLE = {
  error: "Unauthorised role",
  message: "You are not authorised to access this resource",
  status: 403,
};
export const ERROR_UNAUTHORISED_USER_ID = {
  error: "Unauthorised user",
  message: "You are not authorised to access this resource",
  status: 403,
};

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const AUTHORIZATION = "Authorization";

const authorizeRoles = (user) => new Promise((resolve, reject) => {
  if (!isUserAuthorized(user)) {
    reject(ERROR_UNAUTHORISED_ROLE);
  } else {
    resolve();
  }
});

export const authorise = (request) => {
  let user;
  const bearerToken = request.get(AUTHORIZATION) || (request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null);

  if (!bearerToken) {
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  request.accessToken = bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken;

  return getTokenDetails(bearerToken)
    .then((tokenDetails) => user = tokenDetails)
    .then(() => authorizeRoles(user))
    .then(() => user);
};
