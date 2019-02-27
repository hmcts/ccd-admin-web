import * as config from "config";
import { render } from "../util/render";
import { validate } from "../validators/validateJurisdiction";

const router = require("../routes/home");
const url = config.get("adminWeb.userprofiles_url");
const userProfilesPage = "user-profiles";

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(userProfilesPage);
  }
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    res.render(userProfilesPage);
  }
});

export default router;
