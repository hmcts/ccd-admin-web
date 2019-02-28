import * as config from "config";
import { render } from "../util/render";
import router from "./home";
import { validate } from "../validators/validateJurisdiction";

const url = config.get("adminWeb.userprofiles_url");
const userProfilesPage = "user-profiles";

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    // res.render(userProfilesPage);
    render(req, res, next, url, {}, userProfilesPage);
  }
});

/* GET */
router.get("/userprofiles", (req, res, next) => {
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    render(req, res, next, url, query, userProfilesPage);
  } else {
    render(req, res, next, url, {}, userProfilesPage);
  }
});

export default router;
