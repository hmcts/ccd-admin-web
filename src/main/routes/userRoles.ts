import * as config from "config";
import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { fetch } from "../service/get-service";
import { sanitize } from "../util/sanitize";
import { saveUserRole } from "../service/update-user-role";
import { UserRole } from "../domain/userrole";
import { Validator } from "../validators/validate";

const router = express.Router();
const errorPage = "error";
const classifications = [{ id: "PUBLIC", name: "PUBLIC" },
{ id: "PRIVATE", name: "PRIVATE" }, { id: "RESTRICTED", name: "RESTRICTED" }];
const createUserRoleText = "Create";
const updateUserRoleText = "Update";
const createUserRoleHeading = "Create User Role";
const updateUserRoleHeading = "Update User Role";
const url = config.get("adminWeb.alluserroles_url");

/* GET User roles landing page. */
router.get("/user-roles", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  delete req.session.error;
  delete req.session.success;
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    fetch(req, url).then((response) => {
        responseContent.userroles = JSON.parse(response);
        res.render("user-roles", responseContent);
    })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* GET User roles landing page. */
router.get("/user-roles-list", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = JSON.stringify(req.authentication.user);
  if (req.session.error) {
    responseContent.error = req.session.error;
  }
  if (req.session.success) {
    responseContent.success = req.session.success;
    // Clear success message so it doesn't appear subsequently
    delete req.session.success;
  }
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    fetch(req, url).then((response) => {
      responseContent.userroles = JSON.parse(response);
      res.render("user-roles", responseContent);
    })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* GET create user roles form. */
router.get("/create-user-role-form", (req, res, next) => {
  if (req.query.save) {
    delete req.session.error;
  }
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.submitUserRoleEndPoint = "/createuserrole";
    responseContent.securityClassifications = classifications;
    responseContent.heading = createUserRoleHeading;
    responseContent.submitButtonText = createUserRoleText;

    if (req.session.error) {
      responseContent.error = req.session.error;
      responseContent.update = req.session.error.errorBy === "update";
    }
    res.render("user-roles/create-user-roles", responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
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
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.update = true;
    responseContent.role = req.body.role;
    responseContent.submitUserRoleEndPoint = "/updateuserrole";
    responseContent.securityClassifications = classifications;
    responseContent.chosenClassification = req.body.classification;
    responseContent.heading = updateUserRoleHeading;
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
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
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
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

router.post("/updateuserroleform", validateUpdateForm, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.update = true;
    responseContent.role = req.body.role;
    responseContent.submitUserRoleEndPoint = "/updateuserrole";
    responseContent.securityClassifications = classifications;
    responseContent.chosenClassification = req.body.classification;
    responseContent.heading = updateUserRoleHeading;
    responseContent.submitButtonText = updateUserRoleText;
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    res.render("user-roles/create-user-roles", responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

router.post("/updateuserrole", validateUpdate, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canManageUserRole) {
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
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
