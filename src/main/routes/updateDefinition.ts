import * as config from "config";
import { fetch } from "../service/get-service";
import router from "./home";
import { sanitize } from "../util/sanitize";

const url = config.get("adminWeb.jurisdiction_url");

/* POST form data to Create Definition form. */
router.post("/updatedefinition", (req, res, next) => {
  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.jurisdictions = JSON.stringify(response);
    responseContent.currentjurisdiction = sanitize(req.session.jurisdiction);
    responseContent.casetypes = sanitize(req.body.casetypes);
    responseContent.description = sanitize(req.body.description);
    responseContent.status = sanitize(req.body.status);
    responseContent.version = req.body.version;
    responseContent.update = "true";
    responseContent.heading = "Update Definition";
    responseContent.submitButtonText = "Update";
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("definition/create-definition-form", responseContent);
  })
  .catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });
});

export default router;
