import { COOKIE_ACCESS_TOKEN } from "./oauth2redirect";
import * as express from "express";
import * as fetch from "node-fetch";
import { get } from "config";

const router = express.Router();
const TOKEN_PLACEHOLDER = ":token";

export const logout = (req, res, next) => {
  const accessToken = req.cookies && req.cookies[COOKIE_ACCESS_TOKEN];

  if (accessToken) {
    const options = {
      headers: {
        "Authorization": "Basic "
          + Buffer.from(get("idam.oauth2.client_id") + ":" + get("idam.oauth2.client_secret"))
            .toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "DELETE",
    };
    fetch(get("idam.oauth2.logout_endpoint").replace(TOKEN_PLACEHOLDER, accessToken), options)
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
