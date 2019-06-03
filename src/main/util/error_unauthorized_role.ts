import { ERROR_UNAUTHORIZED_ROLE } from "../user/user-request-authorizer";

export function error_unauthorized_role(req) {
  const responseContent: { [k: string]: any } = {};
  responseContent.error = ERROR_UNAUTHORIZED_ROLE;
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  if (req.authentication) {
    responseContent.user = JSON.stringify(req.authentication.user);
  }
  return responseContent;
}
