import * as express from "express";
import { sanitize } from "../util/sanitize";
import { Logger } from "@hmcts/nodejs-logging";

const logger = Logger.getLogger(__filename);
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};

  logger.info("11111111111 req adminWebAuthorization=", req.session.adminWebAuthorization);
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  logger.info("22222222222 res adminWebAuthorization=", responseContent.adminWebAuthorization);

  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  res.render("home", responseContent);
});

export default router;
