import { deleteDefinition } from "../service/delete-definition-service";
import { deleteSessionVariables } from "../util/clearSession";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import router from "./home";

const errorPage = "error";
/**
 * Delete Definition based on jurisdiction ID and version
 */
router.post("/deletedefinition", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    if (req.body.deleteItem === "Yes") {
        deleteDefinition(req).then((response) => {
            deleteSessionVariables(req);
            req.session.success = "Successfully deleted the definition.";
            res.redirect(302, "/definitions");
        }).catch((error) => {
            req.session.error = {
                status: 400, text: error.rawResponse ? error.rawResponse :
                    "Unexpected error : Please contact your administrator",
            };
            res.redirect(302, `/deleteitem?item=${req.body.itemToDelete}&jurisdictionId=${req.body.jurisdictionId}`
              + `&version=${req.body.definitionVersion}`);
        });
    } else if (req.body.deleteItem === "No") {
        deleteSessionVariables(req);
        res.redirect(302, "/definitions");
    } else {
        deleteSessionVariables(req);
        req.session.response = { error: "Please choose Yes or No" };
        res.redirect(302, `/deleteitem?item=${req.body.itemToDelete}&jurisdictionId=${req.body.jurisdictionId}`
          + `&version=${req.body.definitionVersion}`);
    }
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

export default router;
