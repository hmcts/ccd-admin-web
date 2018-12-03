import { fetchUserProfilesByJurisdiction } from "../service/user-profile-service";
import { Validator } from "../validators/validate";
import { sanitize } from "../util/sanitize";

const router = require("../routes/home");

// Validate
function validate(req, res, next) {

  const jurisdictionName = new Validator(req.body.jurisdictionName);
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else {
    req.body.jurisdictionName = sanitize(req.body.jurisdictionName);
    req.session.jurisdiction = req.body.jurisdictionName;
    next();
  }
}

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {

  fetchUserProfilesByJurisdiction(req).then((response) => {
    res.status(200);
    req.session.jurisdiction = req.body.jurisdictionName;
    const responseContent: { [k: string]: any } = {};
    responseContent.userprofiles = JSON.parse(response);
    responseContent.currentjurisdiction = req.body.jurisdictionName;
    res.render("user-profiles", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  const jurisdiction = req.session.jurisdiction;
  fetchUserProfilesByJurisdiction(req).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.userprofiles = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    if (req.session.success) {
      responseContent.success = req.session.success;
    }
    responseContent.jurisdiction = jurisdiction;
    res.render("user-profiles", responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });

});

export default router;
