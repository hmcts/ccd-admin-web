import { fetch } from "../util/fetch";
import { format } from "url";
import config from "config";
import { Logger } from "@hmcts/nodejs-logging";

const completeRedirectURI = (uri) => {
  if (!uri.startsWith("http")) {
    return `https://${uri}`;
  }
  return uri;
};

const oauthEndpoint: string = config.get<string>("idam.oauth2.token_endpoint");
const idamOAuth2ClientId: string = config.get<string>("idam.oauth2.client_id");
const idamOAuth2ClientSecret: string = config.get<string>("secrets.ccd.ccd-admin-web-oauth2-client-secret");

export function accessTokenRequest(request): Promise<any> {

  const options = {
    headers: {
      "Authorization": "Basic "
        + Buffer.from(idamOAuth2ClientId + ":" + idamOAuth2ClientSecret)
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
  return fetch(oauthEndpoint + format({ query: params }), options)
    .then((response) =>
      response.status === 200 ? response : response.text().then((text) => Promise.reject(new Error(text))))
    .then((response) => response.json())
    .catch((error) => {
      logger.error("Failed to obtain access token:", error);
      throw error;
    });
}
