import * as config from "config";
import { fetch } from "../service/get-service";
import router from "./home";

const url = config.get("adminWeb.jurisdiction_url");

/* GET Jurisdiction page. */
router.get("/jurisdiction", (req, res, next) => {
  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.jurisdictions = JSON.parse(response);
    if (req.query.dest) {
      responseContent.destination = req.query.dest;
    }
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("jurisdiction", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* tslint:disable:no-default-export */
export default router;
