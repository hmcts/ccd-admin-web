import { ERROR_UNAUTHORIZED_ROLE } from "../user/user-request-authorizer";

export function error_unauthorized_role() {
  const responseContent: { [k: string]: any } = {};
  responseContent.error = ERROR_UNAUTHORIZED_ROLE;
  return responseContent;
}
