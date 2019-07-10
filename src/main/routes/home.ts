import * as express from "express";
import { sanitize } from "../util/sanitize";
const router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  res.render("home", responseContent);
});

export default router;
