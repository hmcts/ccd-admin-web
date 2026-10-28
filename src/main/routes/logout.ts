import { COOKIE_ID_TOKEN, COOKIE_ACCESS_TOKEN } from "./oauth2redirect";
import express from "express";
import config from "config";

const router = express.Router();

export const logout = (req, res) => {
  const idToken = req.cookies && req.cookies[COOKIE_ID_TOKEN];
  const logoutUrl = new URL("/o/endSession", config.get<string>("idam.web_public_url"));
  logoutUrl.searchParams.set("post_logout_redirect_uri", `${req.protocol}://${req.get("host")}/`);
  if (idToken) {
    logoutUrl.searchParams.set("token", idToken);
  }

  res.clearCookie(COOKIE_ID_TOKEN);
  res.clearCookie(COOKIE_ACCESS_TOKEN);
  req.session = null;
  res.redirect(302, logoutUrl.toString());
};

/* tslint:disable:no-default-export */
export default router.get("/logout", logout);
