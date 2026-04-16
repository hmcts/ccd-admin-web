import * as fetch from "node-fetch";
import { format, URL } from "url";
import { get } from "config";
import { Logger } from "@hmcts/nodejs-logging";

const ERROR_INVALID_REDIRECT_URI = {
  code: "INVALID_REDIRECT_URI",
  error: "Bad Request",
  message: "Redirect URI is not permitted",
  status: 400,
};

const completeRedirectURI = (uri) => {
  let parsedUrl;
  try {
    const fullUri = uri.startsWith("http") ? uri : `https://${uri}`;
    parsedUrl = new URL(fullUri);
  } catch (e) {
    throw ERROR_INVALID_REDIRECT_URI;
  }
  const allowedHosts = (get("idam.oauth2.redirect_uri_allowlist") as string)
    .split(",")
    .map((h) => h.trim());
  if (allowedHosts.indexOf(parsedUrl.hostname) === -1) {
    throw ERROR_INVALID_REDIRECT_URI;
  }
  return parsedUrl.href;
};

export function accessTokenRequest(request) {

  const options = {
    headers: {
      "Authorization": "Basic "
        + Buffer.from(get("idam.oauth2.client_id") + ":" + get("secrets.ccd.ccd-admin-web-oauth2-client-secret"))
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
