import * as express from "express";
import { UserRole } from "../domain/userrole";
import { createUserRole } from "../service/create-user-role";
import { sanitize } from "../util/sanitize";
import { Validator } from "../validators/validate";

const router = express.Router();
const classifications = [{ id: "PUBLIC", name: "PUBLIC" },
{ id: "PRIVATE", name: "PRIVATE" }, { id: "RESTRICTED", name: "RESTRICTED" }];
const createUserRoleText = "Create User Roles";

/* GET User roles landing page. */
router.get("/user-roles", (req, res, next) => {
  delete req.session.error;
  delete req.session.success;
  res.render("user-roles");
});

/* GET User roles landing page. */
router.get("/user-roles-list", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  if (req.session.error) {
    responseContent.error = req.session.error;
  }
  if (req.session.success) {
    responseContent.success = req.session.success;
  }
  res.render("user-roles", responseContent);
});

/* GET create user roles form. */
router.get("/create-user-role-form", (req, res, next) => {
  if (req.query.save) {
    delete req.session.error;
  }
  const responseContent: { [k: string]: any } = {};
  responseContent.securityClassifications = classifications;
  responseContent.submitButtonText = createUserRoleText;

  if (req.session.error) {
    responseContent.error = req.session.error;
  }
  res.render("user-roles/create-user-roles", responseContent);
});

// Validate
function validate(req, res, next) {
  const role = new Validator(req.body.role);
  const classification = new Validator(req.body.classification);
  delete req.session.success;
  if (role.isEmpty() || classification.isEmpty()) {
    req.session.error = { status: 401, text: "Please add role / classification." };
    res.redirect(302, "/create-user-role");
  } else {
    delete req.session.error;
    next();
  }
}

router.post("/createuserrole", validate, (req, res, next) => {
  createUserRole(req, new UserRole(sanitize(req.body.role), sanitize(req.body.classification)))
    .then((response) => {
      req.session.success = `User role  created.`;
      res.redirect(302, "/user-roles-list");
    })
    .catch((error) => {
      req.session.error = {
        status: 400, text: error.rawResponse ? error.rawResponse :
          error.message ? error.message : "Invalid data",
      };
      res.redirect(302, "/create-user-role");
    });
});

module.exports = router;
/* tslint:disable:no-default-export */
export default router;
