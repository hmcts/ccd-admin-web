import { fetchAll } from "../service/jurisdiction.service";
import { createUserProfile } from "../service/create-user-service";
import { UserProfile } from "../domain/userprofile";
const router = require("../routes/home");

/* GET create user form. */
router.get("/createuser", (req, res, next) => {

  fetchAll(req).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.jurisdictions = JSON.stringify(response);
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

/* POST create user result. */
router.post("/createuser", (req, res, next) => {
  const currentJurisdiction = req.body.jurisdiction ? req.body.jurisdiction : req.session.jurisdiction;

  if (currentJurisdiction === undefined) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else {
    createUserProfile(req, new UserProfile(req.body.idamId, currentJurisdiction,
      req.body.jurisdictionDropdown, req.body.caseTypeDropdown, req.body.stateDropdown))
      .then((response) => {
        req.session.success = "Created user profile";
        if (req.body.update) {
          req.session.success = "Updated user profile";
        }
        res.redirect(302, `/userprofiles?jursidiction=${currentJurisdiction}`);
      })
      .catch((error) => {
        req.session.error = { status: 400, text: error.rawResponse };
        res.redirect(302, `/createuser?jurisdiction=${currentJurisdiction}`);
      });
  }
});
/* tslint:disable:no-default-export */
export default router;
