import { fetchAll } from "../service/jurisdiction.service";
import { createUserProfile } from "../service/create-user-service";
import { UserProfile } from "../domain/userprofile";
const router = require("../routes/home");
const validator = require("validator");
import { Validator } from "../validators/validate";
import { sanitize } from "../util/sanitize";

/* GET create user form. */
router.get("/createuser", (req, res, next) => {

  fetchAll(req).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.jurisdictions = JSON.stringify(response);
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.heading = "Create User profile";
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

// Validate
function validate(req, res, next) {
  const jurisdictionName = new Validator(req.body.currentjurisdiction);
  delete req.session.success;
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else if (!validator.isEmail(req.body.idamId)) {
    req.session.error = { status: 401, text: "Please select a valid email address!" };
    res.redirect(302, "/createuser");
  } else {
    delete req.session.error;
    next();
  }
}
/* POST create user result. */
router.post("/createuser", validate, (req, res, next) => {

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
