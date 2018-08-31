import * as express from "express";

const router = express.Router();

/* GET User roles landing page. */
router.get("/user-roles", (req, res, next) => {
  res.render("user-roles");
});

/* GET create user roles form. */
router.get("/create-user-role", (req, res, next) => {
  const responseObject = {

    securityClassifications: [{ id: "PUBLIC", name: "PUBLIC" },
    { id: "PRIVATE", name: "PRIVATE" }, { id: "RESTRICTED", name: "RESTRICTED" }],
    submitButtonText: "Create User Roles",
  };
  res.render("user-roles/create-user-roles", responseObject);
});
module.exports = router;
/* tslint:disable:no-default-export */
export default router;
