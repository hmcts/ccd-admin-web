import { sanitize } from "../util/sanitize";
import { fetchDefinitionsByJurisdiction } from "../service/definition-service";

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

  // Currently using a "dummy" implementation, which retrieves user profiles but does nothing with them
  // TODO Provide proper implementation for fetchDefinitionsByJurisdiction
  fetchDefinitionsByJurisdiction(req).then((response) => {
    res.status(200);
    req.session.jurisdiction = req.body.jurisdictionName;
    const responseContent: { [k: string]: any } = {};
    responseContent.definitions = JSON.parse(response);
    responseContent.currentjurisdiction = req.body.jurisdictionName;
    res.render("definitions", responseContent);
  }).catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET */
router.get("/definitions", (req, res, next) => {

  // Currently using a "dummy" implementation, which retrieves user profiles but does nothing with them
  // TODO Provide proper implementation for fetchDefinitionsByJurisdiction
  fetchDefinitionsByJurisdiction(req).then((response) => {
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
