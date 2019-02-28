import * as config from "config";
import { render } from "../util/render";
import router from "./home";
import { validate } from "../validators/validateJurisdiction";

const definitionsPage = "definitions";
const url = config.get("adminWeb.definitions_url");

/* POST */
router.post("/definitions", validate, (req, res, next) => {

  const query = { jurisdiction: req.body.jurisdictionName };
  render(req, res, next, url, query, definitionsPage);
});

/* GET */
router.get("/definitions", (req, res, next) => {

  // Jurisdiction is expected to be set already on the session, hence it can be used for the query
  const query = req.session.jurisdiction ? { jurisdiction: req.session.jurisdiction } : {};
  render(req, res, next, url, query, definitionsPage);
});

export default router;
