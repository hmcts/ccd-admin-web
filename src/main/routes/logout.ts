import { COOKIE_ACCESS_TOKEN } from "./oauth2redirect";
import express from "express";
import fetch from "node-fetch";
import config from "config";

const router = express.Router();
const TOKEN_PLACEHOLDER = ":token";
const clientId = config.get<string>("idam.oauth2.client_id");
const clientSecret = config.get<string>("secrets.ccd.ccd-admin-web-oauth2-client-secret");
const logoutEndpoint = config.get<string>("idam.oauth2.logout_endpoint");

export const logout = (req: any, res: any, next: any) => {
  const accessToken = req.cookies && req.cookies[COOKIE_ACCESS_TOKEN];

  if (accessToken) {
    const options = {
      headers: {
        "Authorization": "Basic "
          + Buffer.from(clientId + ":" + clientSecret)
            .toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "DELETE",
    };
    fetch(logoutEndpoint.replace(TOKEN_PLACEHOLDER, accessToken), options)
      .then(() => {
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
