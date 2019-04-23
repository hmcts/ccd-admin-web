import * as express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = JSON.stringify(req.authentication.user);
  res.render("home", responseContent);
});

export default router;
