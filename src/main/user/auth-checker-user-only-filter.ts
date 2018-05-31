import { authorise } from "./user-request-authorizer";
import { get } from "config";
import { Logger } from "@hmcts/nodejs-logging";

export const authCheckerUserOnlyFilter = (req, res, next) => {

  const PATH_OAUTH2_REDIRECT = "/oauth2redirect";
  // let originalUrl = req.originalUrl;
  // originalUrl += req.originalUrl.endsWith("/") ? "" : "/";
  const REDIRECT_URI = encodeURIComponent(`${req.protocol}://${req.get("host")}${PATH_OAUTH2_REDIRECT}`);
  req.authentication = {};
  const logger = Logger.getLogger(__filename);

  authorise(req)
    .then((user) => req.authentication.user = user)
    .then(() => next())
    .catch((error) => {
      logger.warn("Unsuccessful user authentication", error);
      res.redirect(302, `${get("adminWeb.login_url")}/?response_type=code&client_id=` +
        `${get("idam.oauth2.client_id")}&redirect_uri=${REDIRECT_URI}`);
    });
};
