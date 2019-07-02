import { error_unauthorized_role } from "../util/error_unauthorized_role";
import router from "./home";
import { sanitize } from "../util/sanitize";

const errorPage = "error";

/* GET */
router.get("/deleteitem", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.response = req.session.response;
    responseContent.itemToDelete = sanitize(req.query.item);

    if (req.query.item === "user") {
      responseContent.idamId = sanitize(req.query.idamId);
      responseContent.warning = sanitize(`Are you sure you would like to delete user ${req.query.idamId}?`);
      responseContent.headingItem = "User Profile";
    }

    if (req.query.item === "definition") {
      responseContent.currentJurisdiction = sanitize(req.query.jurisdictionId);
      responseContent.version = sanitize(req.query.version);
      responseContent.warning = "Are you sure you would like to delete the selected definition?";
      responseContent.headingItem = "Definition";
    }

    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    res.render("confirm-delete-item", responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
