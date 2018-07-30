import * as express from "express";

const router = express.Router();

const session = require("express-session");
router.use(session({
  cookie: { maxAge: 60000 },
  resave: true, saveUninitialized: true, secret: "keyboard cat",
}));

/* GET home page. */
router.get("/import", (req, res, next) => {
  res.render("home");
});

router.get("/", (req, res, next) => {
  res.redirect(302, "/import");
});

module.exports = router;
/* tslint:disable:no-default-export */
export default router;
