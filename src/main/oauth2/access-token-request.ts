import * as fetch from "node-fetch";
import { format } from "url";
import { get } from "config";
import { Logger } from "@hmcts/nodejs-logging";

const completeRedirectURI = (uri) => {
  if (!uri.startsWith("http")) {
    return `https://${uri}`;
  }
  return uri;
};

export function accessTokenRequest(request) {
  const options = {
    headers: {
      "Authorization": "Basic "
        + Buffer.from(get("idam.oauth2.client_id") + ":" + get("idam.oauth2.client_secret"))
        .toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  };
  const params = {
    code: request.query.code,
    grant_type: "authorization_code",
    redirect_uri: completeRedirectURI(request.query.redirect_uri),
  };
  const logger = Logger.getLogger(__filename);
  return fetch(get("idam.oauth2.token_endpoint") + format({ query: params }), options)
    .then((response) =>
      response.status === 200 ? response : response.text().then((text) => Promise.reject(new Error(text))))
    .then((response) => response.json())
    .catch((error) => {
      logger.error("Failed to obtain access token:", error);
      throw error;
    });
}
