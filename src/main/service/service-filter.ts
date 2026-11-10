import { serviceTokenGenerator } from "./service-token-generator";
import { Logger } from "@hmcts/nodejs-logging";

export const serviceFilter = (req: any, res: any, next: any) => {
  const logger = Logger.getLogger(__filename);
  serviceTokenGenerator()
    .then((t) => {
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
