
import { fetchUsers } from "../service/user.profiles.service";
import { Jurisdiction } from "../domain/jurisdiction";
import { Validator } from "../validators/validate";

const router = require("../routes/home");

// Validate
function validate(req, res, next) {
  const jurisdictionName = new Validator(req.body.jurisdictionName);
  if (jurisdictionName.isEmpty()) {
    req.session.error = { status: 401, text: "Please select jurisdiction name" };
    res.redirect(302, "/jurisdiction");
  } else {
    next();
  }
}

/* GET home page. */
router.post("/userprofiles", validate, (req, res, next) => {
  const user: Jurisdiction = fetchUsers(new Jurisdiction(req.body.jurisdictionName, "AAAAA"));
  res.render("jurisdictions", { jurisdictionName: user.id });
});

/* tslint:disable:no-default-export */
export default router;
