import { authorize } from "./user-request-authorizer";
import { get } from "config";
import { Logger } from "@hmcts/nodejs-logging";

export const authCheckerUserOnlyFilter = (req, res, next) => {

  const PATH_OAUTH2_REDIRECT = "/oauth2redirect";
  // let originalUrl = req.originalUrl;
  // originalUrl += req.originalUrl.endsWith("/") ? "" : "/";
  const REDIRECT_URI = encodeURIComponent(`${req.protocol}://${req.get("host")}${PATH_OAUTH2_REDIRECT}`);
  req.authentication = {};
  const logger = Logger.getLogger(__filename);

  logger.info("REDIRECT_URI !!!!!!" + REDIRECT_URI);
  logger.info("req.authentication!!!!!! " + req.authentication);
  logger.info("req.authentication..user!!!!!! " + req.authentication.user);
  logger.info("req.protocol!!!!!! " + req.protocol);
  logger.info("method!!"  + req.method);
  logger.info("headers!!" + req.headers);

  for (const property in req.headers) {
    if (req.headers.hasOwnProperty(property)) {
      logger.info(property + ": VALUE :" + req.headers[property]);
    }
  }

  authorize(req)
    .then((user) => req.authentication.user = user)
    .then(() => {
      logger.info("authentication done !! all good valid toekn.");
      next();
    })
    .catch((error) => {
      logger.warn("Unsuccessful user authentication", error);
      if (error.status === 403) {
        logger.info("Inside error.status==403");
        next(error);
      } else {
        logger.info("redirect to: " + REDIRECT_URI);
        res.redirect(302, `${get("adminWeb.login_url")}/?response_type=code&client_id=` +
          `${get("idam.oauth2.client_id")}&redirect_uri=${REDIRECT_URI}`);
      }
    });
};
