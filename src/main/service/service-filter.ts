import { serviceTokenGenerator } from "./service-token-generator";
import { Logger } from "@hmcts/nodejs-logging";

export const serviceFilter = (req, res, next) => {
  const logger = Logger.getLogger(__filename);
  serviceTokenGenerator()
    .then((t) => {
      console.log('t serviceTokenGenerator'+ t);
      console.log('adding serviceAuthToken');
      req.serviceAuthToken = t;
      next();
    })
    .catch((error) => {
      logger.warn("Unsuccessful S2S authentication", error);
      next({
        status: error.status || 401,
      });
    });
};
