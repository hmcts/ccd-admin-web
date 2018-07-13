import * as express from "express";
import { fetchAll } from "../service/jurisdiction.service";

const router = express.Router();

/* GET Jurisdiction page. */
router.get("/createuser", (req, res, next) => {

  fetchAll(req).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.jurisdictions = JSON.stringify(response);
    res.render("user-profiles/create-user-form", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* tslint:disable:no-default-export */
export default router;
