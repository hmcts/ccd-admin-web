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
