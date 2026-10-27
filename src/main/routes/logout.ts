import { COOKIE_ID_TOKEN, COOKIE_ACCESS_TOKEN } from "./oauth2redirect";
import express from "express";
import fetch from "node-fetch";
import config from "config";

const router = express.Router();

export const logout = (req, res, next) => {
  const idToken = req.cookies && req.cookies[COOKIE_ID_TOKEN];

  if (idToken) {
    const options = {
      headers: {
        "Authorization": "Basic "
          + Buffer.from(config.get("idam.oauth2.client_id") + ":" + config.get("secrets.ccd.ccd-admin-web-oauth2-client-secret"))
            .toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "GET",
    };
    fetch(config.get("idam.web_public_url") + "/o/endSession?token=" + idToken, options)
      .then(() => {
        res.clearCookie(COOKIE_ID_TOKEN);
        res.clearCookie(COOKIE_ACCESS_TOKEN);
        // Delete the session
        req.session = null;
        // Redirect to / (index), which will itself redirect to IdAM login page, as the user is not authenticated
        res.redirect(302, "/");
      })
      .catch((err) => next(err));
  } else {
    next({
      error: "No auth token",
      message: "No auth token to log out",
      status: 400,
    });
  }
};

/* tslint:disable:no-default-export */
export default router.get("/logout", logout);
