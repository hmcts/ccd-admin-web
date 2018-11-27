import * as express from "express";
import * as config from "config";

import { UserRole } from "../domain/userrole";
import { saveUserRole } from "../service/update-user-role";
import { fetch } from "../service/get-service";
import { sanitize } from "../util/sanitize";
import { Validator } from "../validators/validate";
const router = express.Router();
const classifications = [{ id: "PUBLIC", name: "PUBLIC" },
{ id: "PRIVATE", name: "PRIVATE" }, { id: "RESTRICTED", name: "RESTRICTED" }];
const createUserRoleText = "Create User Roles";
const updateUserRoleText = "Update User Roles";
const url = config.get("adminWeb.alluserroles_url");

/* GET User roles landing page. */
router.get("/user-roles", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  delete req.session.error;
  delete req.session.success;
  fetch(req, url).then((response) => {
    responseContent.userroles = JSON.parse(response);
    res.render("user-roles", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
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
  fetch(req, url).then((response) => {
    responseContent.userroles = JSON.parse(response);
    res.render("user-roles", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* GET create user roles form. */
router.get("/create-user-role-form", (req, res, next) => {
  if (req.query.save) {
    delete req.session.error;
  }
  const responseContent: { [k: string]: any } = {};
  responseContent.submitUserRoleEndPoint = "/createuserrole";
  responseContent.securityClassifications = classifications;
  responseContent.submitButtonText = createUserRoleText;

  if (req.session.error) {
    responseContent.error = req.session.error;
    responseContent.update = req.session.error.errorBy === "update";
  }
  res.render("user-roles/create-user-roles", responseContent);
});

// Validate
function validate(req, res, next) {
  const role = new Validator(req.body.role);
  const classification = new Validator(req.body.classification);
  delete req.session.success;
  return (!role.isAlphanumber() || !classification.isAlphanumber());
}
// Validate create
function validateCreate(req, res, next) {
  validateAndRedirect(req, res, next, "/create-user-role-form");
}

function validateAndRedirect(req, res, next, path) {
  if (validate(req, res, next)) {
    req.session.error = { status: 401, text: "Please add correct role / classification." };
    res.redirect(302, path);
  } else {
    delete req.session.error;
    next();
  }
}
// Validate update
function validateUpdate(req, res, next) {
  if (validate(req, res, next)) {
    const responseContent: { [k: string]: any } = {};
    responseContent.update = true;
    responseContent.role = req.body.role;
    responseContent.submitUserRoleEndPoint = "/updateuserrole";
    responseContent.securityClassifications = classifications;
    responseContent.chosenClassification = req.body.classification;
    responseContent.submitButtonText = updateUserRoleText;
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    res.render("user-roles/create-user-roles", responseContent);
  } else {
    delete req.session.error;
    next();
  }
}

// Validate update
function validateUpdateForm(req, res, next) {
  validateAndRedirect(req, res, next, "/user-roles-list");
}

router.post("/createuserrole", validateCreate, (req, res, next) => {
  saveUserRole(req, new UserRole(sanitize(req.body.role), sanitize(req.body.classification)), true)
    .then((response) => {
      req.session.success = `User role created.`;
      res.redirect(302, "/user-roles-list");
    })
    .catch((error) => {
      req.session.error = {
        status: 400, text: error.rawResponse ? error.rawResponse :
          error.message ? error.message : "Invalid data",
      };
      res.redirect(302, "/create-user-role-form");
    });
});

router.post("/updateuserroleform", validateUpdateForm, (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.update = true;
  responseContent.role = req.body.role;
  responseContent.submitUserRoleEndPoint = "/updateuserrole";
  responseContent.securityClassifications = classifications;
  responseContent.chosenClassification = req.body.classification;
  responseContent.submitButtonText = updateUserRoleText;
  if (req.session.error) {
    responseContent.error = req.session.error;
  }
  res.render("user-roles/create-user-roles", responseContent);
});

router.post("/updateuserrole", validateUpdate, (req, res, next) => {
  saveUserRole(req, new UserRole(sanitize(req.body.role), sanitize(req.body.classification)), false)
    .then((response) => {
      req.session.success = `User role updated.`;
      res.redirect(302, "/user-roles-list");
    })
    .catch((error) => {
      req.session.error = {
        errorBy: "update", status: 400, text: error.rawResponse ? error.rawResponse :
          error.message ? error.message : "Invalid data",
      };
      res.redirect(302, "/create-user-role-form");
    });
});

module.exports = router;
export default router;
