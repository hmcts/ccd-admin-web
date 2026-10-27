import { authorize } from "./user-request-authorizer";
import config from "config";
import { Logger } from "@hmcts/nodejs-logging";

export const authCheckerUserOnlyFilter = (req: any, res: any, next: any) => {

  const PATH_OAUTH2_REDIRECT = "/oauth2redirect";
  // let originalUrl = req.originalUrl;
  // originalUrl += req.originalUrl.endsWith("/") ? "" : "/";
  const REDIRECT_URI = encodeURIComponent(`${req.protocol}://${req.get("host")}${PATH_OAUTH2_REDIRECT}`);
  const SCOPE = encodeURIComponent(config.get("idam.oauth2.scope"));
  req.authentication = {};
  const logger = Logger.getLogger(__filename);

  const idamWebPublicUrl: string = config.get<string>("idam.web_public_url");
  const idamClientId: string = config.get<string>("idam.oauth2.client_id");

  authorize(req)
    .then((user) => req.authentication.user = user)
    .then(() => next())
    .catch((error) => {
      logger.warn("Unsuccessful user authentication", error);
      if (error.status === 403) {
        next(error);
      } else {
        res.redirect(302, `${idamWebPublicUrl}/o/authorize?response_type=code&client_id=` +
          `${idamClientId}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`);
      }
    });
};
