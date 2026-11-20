import { fetch } from "../util/fetch";
import { format, URL } from "url";
import config from "config";
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
    const error = Object.assign({}, ERROR_INVALID_REDIRECT_URI, { cause: e });
    throw error;
  }
  const allowedHosts = config.get<string>("idam.oauth2.redirect_uri_allowlist")
    .split(",")
    .map((h) => h.trim());
  if (!allowedHosts.includes(parsedUrl.hostname)) {
    throw ERROR_INVALID_REDIRECT_URI;
  }
  return parsedUrl.href;
};

const idamWebPublicUrl: string = config.get<string>("idam.web_public_url");
const idamOAuth2ClientId: string = config.get<string>("idam.oauth2.client_id");
const idamOAuth2ClientSecret: string = config.get<string>("secrets.ccd.ccd-admin-web-oauth2-client-secret");

export function accessTokenRequest(request, redirect_uri): Promise<any> {

  const options = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  };
  const params = {
    client_id: idamOAuth2ClientId,
    client_secret: idamOAuth2ClientSecret,
    code: request.query.code,
    grant_type: "authorization_code",
    redirect_uri: completeRedirectURI(redirect_uri),
  };
  const logger = Logger.getLogger(__filename);
  return fetch(idamWebPublicUrl + "/o/token" + format({ query: params }), options)
    .then((response) =>
      response.status === 200 ? response : response.text().then((text) => Promise.reject(new Error(text))))
    .then((response) => response.json())
    .catch((error) => {
      logger.error("Failed to obtain access token:", error);
      throw error;
    });
}
