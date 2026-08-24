import express from "express";
import { sanitize } from "../util/sanitize";

const router = express.Router(); // uses existing instance
/* GET home page. */
router.get("/", (req: any, res: any, next: any) => {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  res.render("home", responseContent);
});

export default router;
