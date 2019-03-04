export function error_unauthorized_role() {
  const responseContent: { [k: string]: any } = {};
  responseContent.error = {
    error: "Unauthorised role",
    message: "You are not authorised to access this resource",
    status: 403,
  };
  return responseContent;
}
