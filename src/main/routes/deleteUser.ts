import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { deleteSessionVariables } from "../util/clearSession";
import { deleteUserProfile } from "../service/delete-user-service";
import { sanitize } from "../util/sanitize";
import router from "./home";

const errorPage = "error";

/**
 * Delete user profile based on IdAM ID
 */
router.post("/deleteuser", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    if (req.body.deleteItem === "Yes") {
      deleteSessionVariables(req);
      deleteUserProfile(req).then((response) => {
        req.session.success = `Successfully deleted the user: ${req.body.idamId}`;
        res.redirect(302, "/userprofiles");
      }).catch((error) => {
        req.session.error = {
          status: 400, text: error.rawResponse ? error.rawResponse :
            "Unexpected error : Please contact your administrator",
        };
        res.redirect(302, `/deleteitem?item=${sanitize(req.body.itemToDelete)}&idamId=${sanitize(req.body.idamId)}`);
      });
    } else if (req.body.deleteItem === "No") {
      deleteSessionVariables(req);
      res.redirect(302, "/userprofiles");
    } else {
      deleteSessionVariables(req);
      req.session.response = {error: "Please choose Yes or No"};
      res.redirect(302, `/deleteitem?item=${sanitize(req.body.itemToDelete)}&idamId=${sanitize(req.body.idamId)}`);
    }
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
