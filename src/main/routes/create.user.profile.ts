import * as express from "express";
import { fetchAll } from "../service/jurisdiction.service";
import { createUserProfile } from "../service/create-user-service";
import { UserProfile } from "../domain/userprofile";

const router = express.Router();

/* GET create user form. */
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

/* POST create user result. */
router.post("/createuser", (req, res, next) => {
  createUserProfile(req, new UserProfile(req.body.idamsId,
    req.body.jurisdictionDropdown, req.body.caseTypeDropdown, req.body.stateDropdown))
    .then((response) => {
      res.status(201);
      res.render("jurisdictions", { sucess: "Creating user profile" });
    })
    .catch((error) => {
      next(error);
    });
});
/* tslint:disable:no-default-export */
export default router;
