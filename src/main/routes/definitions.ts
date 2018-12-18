import * as config from "config";
import { fetch } from "../service/get-service";
import { sanitize } from "../util/sanitize";

const router = require("../routes/home");

// Validate
function validate(req, res, next) {

  // Jurisdiction is guaranteed to be set from the Jurisdiction Search page, since the dropdown uses jQuery validation
  req.body.jurisdictionName = sanitize(req.body.jurisdictionName);
  req.session.jurisdiction = req.body.jurisdictionName;
  next();
}

/* POST */
router.post("/definitions", validate, (req, res, next) => {

  // Currently retrieves user profiles but does nothing with them
  // TODO Switch to "adminWeb.definitions_url", once endpoint is implemented in ccd-definition-store-api
  const url = config.get("adminWeb.userprofiles_url");
  const query = { jurisdiction: req.body.jurisdictionName };
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.currentjurisdiction = req.body.jurisdictionName;
    responseContent.definitions = JSON.parse(response);
    res.render("definitions", responseContent);
  }).catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/definitions", (req, res, next) => {

  // Currently retrieves user profiles but does nothing with them
  // TODO Switch to "adminWeb.definitions_url", once endpoint is implemented in ccd-definition-store-api
  const url = config.get("adminWeb.userprofiles_url");
  // Jurisdiction is expected to be set already on the session, hence it can be used for the query
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.definitions = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    if (req.session.success) {
      responseContent.success = req.session.success;
      // Clear success message so it doesn't appear subsequently
      delete req.session.success;
    }
    res.render("definitions", responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });
});

export default router;
