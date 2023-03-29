import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { deleteSessionVariables } from "../util/clearSession";
import { deleteRole } from "../service/delete-role-service";
import { sanitize } from "../util/sanitize";
import router from "./home";

const errorPage = "error";

/**
 * Delete User Role.
 */
router.post("/deleterole", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    if (req.body.deleteItem === "Yes") {
      deleteSessionVariables(req);
      deleteRole(req).then((response) => {
        req.session.success = `Successfully deleted the role: ${req.body.role}`;
        res.redirect(302, "/user-roles");
      }).catch((error) => {
        req.session.error = {
          status: 400, text: error.rawResponse ? error.rawResponse :
            "Unexpected error : Please contact your administrator",
        };
        res.redirect(302,
            `/deleteitem?item=${sanitize(req.body.itemToDelete)}&roleParameter=${sanitize(req.body.role)}`);
      });
    } else if (req.body.deleteItem === "No") {
      deleteSessionVariables(req);
      res.redirect(302, "/user-roles");
    } else {
      deleteSessionVariables(req);
      req.session.response = {error: "Please choose Yes or No"};
      res.redirect(302,
          `/deleteitem?item=${sanitize(req.body.itemToDelete)}&roleParameter=${sanitize(req.body.role)}`);
    }
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
