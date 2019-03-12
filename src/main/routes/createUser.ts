import * as config from "config";
import { createUserProfile } from "../service/create-user-service";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { fetch } from "../service/get-service";
import router from "./home";
import { sanitize } from "../util/sanitize";
import { UserProfile } from "../domain/userprofile";
import { validate } from "../validators/validateUserProfile";

const errorPage = "error";
const url = config.get("adminWeb.jurisdiction_url");
/* GET create user form. */
router.get("/createuser", (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
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
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

// Apply Validation
function validateCreate(req, res, next) {
  validate(req, res, next, "/createuser");
}
/* POST create user result. */
router.post("/createuser", validateCreate, (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
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
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

export default router;
