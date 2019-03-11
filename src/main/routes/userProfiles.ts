import * as config from "config";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { render } from "../util/render";
import router from "./home";
import { validate } from "../validators/validateJurisdiction";

const errorPage = "error";
const url = config.get("adminWeb.userprofiles_url");
const userProfilesPage = "user-profiles";

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

/* GET */
router.get("/userprofiles", (req, res, next) => {
  // const debug = Debug("ccd-admin-web:admin-web-role-authorizer-filter");
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(errorPage, error_unauthorized_role());
  }
});

export default router;
