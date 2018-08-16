
import { fetchUserProfilesByJurisdiction } from "../service/user.profiles.service";
import { Validator } from "../validators/validate";

const router = require("../routes/home");

// Validate
function validate(req, res, next) {
  const jurisdictionName = new Validator(req.body.jurisdictionName);
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else {
    next();
  }
}

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {

  fetchUserProfilesByJurisdiction(req).then((response) => {
    res.status(201);
    req.session.jurisdiction = req.body.jurisdictionName;
    const responseContent: { [k: string]: any } = {};
    responseContent.userprofiles = JSON.parse(response);
    res.render("jurisdictions", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  fetchUserProfilesByJurisdiction(req).then((response) => {

    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.userprofiles = JSON.parse(response);
    if (req.session.success) {
      responseContent.success = req.session.success;
    }
    res.render("jurisdictions", responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });

});

export default router;
