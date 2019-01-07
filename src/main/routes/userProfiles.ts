import * as config from "config";
import { fetch } from "../service/get-service";
import { validate } from "../validators/validateJurisdiction";

const router = require("../routes/home");

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {

  const url = config.get("adminWeb.userprofiles_url");
  const query = { jurisdiction: req.body.jurisdictionName };
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.currentjurisdiction = req.body.jurisdictionName;
    responseContent.userprofiles = JSON.parse(response);
    res.render("user-profiles", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  const url = config.get("adminWeb.userprofiles_url");
  // Jurisdiction is expected to be set already on the session, hence it can be used for the query
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.userprofiles = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    if (req.session.success) {
      responseContent.success = req.session.success;
      // Clear success message so it doesn't appear subsequently
      delete req.session.success;
    }
    res.render("user-profiles", responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });

});

export default router;
