import { ERROR_UNAUTHORIZED_ROLE } from "../user/user-request-authorizer";
import { sanitize } from "../util/sanitize";

export function error_unauthorized_role(req) {
  const responseContent: { [k: string]: any } = {};
  responseContent.error = ERROR_UNAUTHORIZED_ROLE;
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  if (req.authentication) {
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  }
  return responseContent;
}
