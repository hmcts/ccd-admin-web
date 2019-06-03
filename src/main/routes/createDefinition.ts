import * as config from "config";
import { createDefinition } from "../service/create-definition-service";
import { Definition } from "../domain/definition";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { fetch } from "../service/get-service";
import router from "./home";
import { sanitize } from "../util/sanitize";

const errorPage = "error";
const url = config.get("adminWeb.jurisdiction_url");

/* GET create definition form. */
router.get("/createdefinition", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = JSON.stringify(req.authentication.user);
    responseContent.jurisdictions = JSON.stringify(response);
    responseContent.currentjurisdiction = req.session.jurisdiction;
    responseContent.heading = "Create Definition";
    responseContent.submitButtonText = "Create";
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
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* POST create user result. */
router.post("/createdefinition", (req, res) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    createDefinition(req, new Definition(sanitize(req.session.jurisdiction),
                                         sanitize(req.body.description),
                                         sanitize(req.body.data),
                                         sanitize(req.authentication.user.email),
                                         sanitize(req.body.casetypes),
                                         Number(req.body.version),
                                         sanitize(req.body.status)))
    .then(() => {
      req.session.success = `Definition for ${req.session.jurisdiction} jurisdiction created.`;
      if (req.body.update) {
        req.session.success = `Definition for ${req.session.jurisdiction} jurisdiction updated.`;
      }
      res.redirect(302, "/definitions");
    })
    .catch((error) => {
      req.session.error = {
        status: 400, text: error.rawResponse ? error.rawResponse :
          error.message ? error.message : "Invalid data",
      };
      res.redirect(302, "/createdefinition");
    });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
