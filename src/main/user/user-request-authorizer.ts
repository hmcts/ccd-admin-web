import { getTokenDetails } from "./user-resolver";
import { isUserAuthorized } from "../role/roles-based-authorizer";

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

const authorizeRoles = (user) => new Promise((resolve, reject) => {
  if (!isUserAuthorized(user)) {
    reject(ERROR_UNAUTHORIZED_ROLE);
  } else {
    resolve();
  }
});

export const authorize = (request) => {
  let user;
  const bearerToken = request.get(AUTHORIZATION) || (request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null);
  console.log('Inside user request authorizer. ');
  console.log('Inside user request authorizer.  + request.cookies');

  console.log('request.get(AUTHORIZATION) ' + request.get(AUTHORIZATION));
  console.log('request.cookies[COOKIE_ACCESS_TOKEN]  ' + request.cookies[COOKIE_ACCESS_TOKEN] );
  if (!bearerToken) {
    console.log('inside the if ready to do promise ');
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  request.accessToken = bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken;

  return getTokenDetails(bearerToken)
    .then((tokenDetails) => user = tokenDetails)
    .then(() => authorizeRoles(user))
    .then(() => user);
};
