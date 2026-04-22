import config from "config";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { render } from "../util/render";
import router from "./home";
import path from "path";
import { validate } from "../validators/validateJurisdiction";

const errorPage = "error";
const url = config.get<string>("adminWeb.userprofiles_url");
const userProfilesPage = path.join("user-profiles", "view-user-profiles");

/* POST */
router.post("/userprofiles", validate, (req: any, res: any, next: any) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* GET */
router.get("/userprofiles", (req: any, res: any, next: any) => {
  // const debug = Debug("ccd-admin-web:admin-web-role-authorizer-filter");
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
