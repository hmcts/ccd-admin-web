import { fetch } from "../service/get-service";
import * as config from "config";
import { createUserProfile } from "../service/create-user-service";
import { UserProfile } from "../domain/userprofile";
import { validate } from "../validators/validateUserProfile";
const router = require("../routes/home");

import { sanitize } from "../util/sanitize";
const url = config.get("adminWeb.jurisdiction_url");
/* GET create user form. */
router.get("/createuser", (req, res, next) => {

  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.jurisdictions = JSON.stringify(response);
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.heading = "Create User Profile";
    responseContent.submitButtonText = "Create";
    responseContent.jurisdiction = req.query.jurisdiction ? req.query.jurisdiction : req.session.jurisdiction;
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("user-profiles/create-user-form", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

// Apply Validation
function validateCreate(req, res, next) {
  validate(req, res, next, "/createuser");
}
/* POST create user result. */
router.post("/createuser", validateCreate, (req, res, next) => {

  createUserProfile(req, new UserProfile(sanitize(req.body.idamId), sanitize(req.body.currentjurisdiction),
    sanitize(req.body.jurisdictionDropdown), sanitize(req.body.caseTypeDropdown), sanitize(req.body.stateDropdown)))
    .then((response) => {
      req.session.success = `User profile for ${req.body.idamId} created.`;
      if (req.body.update) {
        req.session.success = `User profile for ${req.body.idamId} updated.`;
      }
      res.redirect(302, "/userprofiles");
    })
    .catch((error) => {
      req.session.error = {
        status: 400, text: error.rawResponse ? error.rawResponse :
          error.message ? error.message : "Invalid data",
      };
      res.redirect(302, "/createuser");
    });
});

export default router;
