import { COOKIE_ID_TOKEN, COOKIE_ACCESS_TOKEN } from "./oauth2redirect";
import express from "express";
import config from "config";
import { fetch } from "../util/fetch";

const router = express.Router();

export const logout = async (req, res, next) => {
  const idToken = req.cookies && req.cookies[COOKIE_ID_TOKEN];
  res.clearCookie(COOKIE_ID_TOKEN);
  res.clearCookie(COOKIE_ACCESS_TOKEN);
  // Replace the authenticated session and require credentials even if IdAM still has an SSO cookie.
  req.session = { forceLogin: true };

  try {
    if (idToken) {
      const logoutUrl = new URL("/o/endSession", config.get<string>("idam.web_public_url"));
      logoutUrl.searchParams.set("token", idToken);
      const clientId = config.get<string>("idam.oauth2.client_id");
      const clientSecret = config.get<string>("secrets.ccd.ccd-admin-web-oauth2-client-secret");

      // IdAM responds with 204, so the application must perform the browser redirect.
      await fetch(logoutUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        signal: AbortSignal.timeout(10_000),
      });
    }
    res.redirect(302, "/");
  } catch {
    next({ status: 502, message: "Unable to complete IdAM logout" });
  }
};

/* tslint:disable:no-default-export */
export default router.get("/logout", logout);
