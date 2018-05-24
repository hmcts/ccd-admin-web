import { getTokenDetails } from "./user-resolver";

export const ERROR_TOKEN_MISSING = {
  error: "Bearer token missing",
  message: "You are not authorized to access this resource",
  status: 401,
};
export const ERROR_UNAUTHORISED_ROLE = {
  error: "Unauthorised role",
  message: "You are not authorized to access this resource",
  status: 403,
};
export const ERROR_UNAUTHORISED_USER_ID = {
  error: "Unauthorised user",
  message: "You are not authorized to access this resource",
  status: 403,
};

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const AUTHORIZATION = "Authorization";

export const authorise = (request) => {
  let user;
  const bearerToken = request.get(AUTHORIZATION) || (request.cookies ? request.cookies[COOKIE_ACCESS_TOKEN] : null);

  if (!bearerToken) {
    return Promise.reject(ERROR_TOKEN_MISSING);
  }

  // Use AccessToken cookie as Authorization header
  if (!request.get(AUTHORIZATION) && bearerToken) {
    if (!request.headers) {
      request.headers = {[AUTHORIZATION]: `Bearer ${bearerToken}`};
    } else {
      request.headers[AUTHORIZATION] = `Bearer ${bearerToken}`;
    }
  }

  return getTokenDetails(bearerToken)
    .then((tokenDetails) => user = tokenDetails)
    .then(() => user);
};
