import * as config from "config";
import * as express from "express";
import { fetch } from "../service/get-service";

const url = config.get("adminWeb.import_audits_url");

const router = express.Router();

/* GET home page. */
router.get("/import", (req, res, next) => {
  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};

    responseContent.importAudits = JSON.parse(response);
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

export default router;
