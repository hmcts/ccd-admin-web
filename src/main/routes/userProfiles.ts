import * as config from "config";
import { render } from "../util/render";
import router from "./home";
import { validate } from "../validators/validateJurisdiction";

const url = config.get("adminWeb.userprofiles_url");
const userProfilesPage = "user-profiles";

/* POST */
router.post("/userprofiles", validate, (req, res, next) => {
  console.log("???????????");

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    console.log("*************************");
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, userProfilesPage);
  } else {
    console.log("NO AUTHORIZATION");
    // res.render(userProfilesPage);
    render(req, res, next, url, {}, userProfilesPage);
  }
});

/* GET */
router.get("/userprofiles", (req, res, next) => {

  console.log("???????????");
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserProfile) {
    console.log("*************************");
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    render(req, res, next, url, query, userProfilesPage);
  } else {
    console.log("NO AUTHORIZATION");
    render(req, res, next, url, {}, userProfilesPage);
  }
});

export default router;
