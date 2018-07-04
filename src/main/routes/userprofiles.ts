import * as express from "express";
import { fetchUsers } from "../service/user.profiles.service";
import { Jurisdiction } from "../domain/jurisdiction";
import { Validator } from "../validators/validate"

const router = express.Router();


// Validate
router.use((req, res, next) => {
  let jurisdictionName = new Validator(req.body.jurisdictionName);
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction")
  } else {
    next();
  }
});


/* GET home page. */
router.post("/userprofiles", (req, res, next) => {

  let user: Jurisdiction = fetchUsers(new Jurisdiction(req.body.jurisdictionName, 'AAAAA'));
  res.render("jurisdictions", { jurisdictionName: user.id });

});

/* tslint:disable:no-default-export */
export default router;