import * as express from "express";
import { fetch } from "../service/get-service";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";

const url = config.get("adminWeb.import_audits_url");

const router = express.Router();

const logger = Logger.getLogger(__filename);

/* GET home page. */
router.get("/import", (req, res, next) => {
  fetch(req, url).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    logger.info(`response 5: ${responseContent}`);

    responseContent.importAudits = JSON.parse(response);
    logger.info(`response 6: ${responseContent.importAudits}`);
    if (req.query.page) {
      delete req.session.error;
    }
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("home", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

router.get("/", (req, res, next) => {
  res.redirect(302, "/import");
});

module.exports = router;
/* tslint:disable:no-default-export */
export default router;
