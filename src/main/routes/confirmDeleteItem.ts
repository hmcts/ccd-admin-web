import { error_unauthorized_role } from "../util/error_unauthorized_role";
import router from "./home";

const errorPage = "error";

/* GET */
router.get("/deleteitem", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.response = req.session.response;
    responseContent.itemToDelete = req.query.item;

    if (req.query.item === "user") {
      responseContent.idamId = req.query.idamId;
      responseContent.warning = `Are you sure you would like to delete user ${req.query.idamId}?`;
      responseContent.headingItem = "User Profile";
    }

    if (req.query.item === "definition") {
      responseContent.currentJurisdiction = req.query.jurisdictionId;
      responseContent.version = req.query.version;
      responseContent.warning = "Are you sure you would like to delete the selected definition?";
      responseContent.headingItem = "Definition";
    }

    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    res.render("confirm-delete-item", responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

export default router;
