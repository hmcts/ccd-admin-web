import * as config from "config";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { render } from "../util/render";
import router from "./home";
import { validate } from "../validators/validateJurisdiction";

const definitionsPage = "definitions";
const errorPage = "error";
const url = config.get("adminWeb.definitions_url");

/* POST */
router.post("/definitions", validate, (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    const query = {jurisdiction: req.body.jurisdictionName};
    render(req, res, next, url, query, definitionsPage);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* GET */
router.get("/definitions", (req, res, next) => {

  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageDefinition) {
    // Jurisdiction is expected to be set already on the session, hence it can be used for the query
    const query = req.session.jurisdiction ? {jurisdiction: req.session.jurisdiction} : {};
    render(req, res, next, url, query, definitionsPage);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
