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

  console.log('REDIRECT_URI !!!!!!' + REDIRECT_URI);
  console.log('req.authentication!!!!!! '+ req.authentication);
  console.log('req.authentication..user!!!!!! '+ req.authentication.user);
  console.log('req.protocol!!!!!! '+ req.protocol);
  console.log('method!!' +req.method);
  console.log('headers!!' + req.headers);

  for (var property in req.headers) {
    if (req.headers.hasOwnProperty(property)) {
      console.log(property + ': VALUE ' + req.headers[property])
    }
  }

  authorize(req)
    .then((user) => req.authentication.user = user)
    .then(() => {
      console.log('authentication done !! all good valid toekn.');
      next();
    })
    .catch((error) => {
      logger.warn("Unsuccessful user authentication", error);
      if (error.status === 403) {
        console.log('Inside error.status==403');
        next(error);
      } else {
        console.log('redirect to: ' + REDIRECT_URI);
        res.redirect(302, `${get("adminWeb.login_url")}/?response_type=code&client_id=` +
          `${get("idam.oauth2.client_id")}&redirect_uri=${REDIRECT_URI}`);
      }
    });
};
