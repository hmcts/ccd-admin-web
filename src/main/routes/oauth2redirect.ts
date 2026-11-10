import express from "express";
import config from "config";
import { accessTokenRequest } from "../oauth2/access-token-request";
import { clearOAuthState, getOAuthState } from "../oauth2/oauth-state";

export const COOKIE_ACCESS_TOKEN = "accessToken";
export const COOKIE_ID_TOKEN = "idToken";
const router = express.Router();

export const oauth2redirect = (req: any, res: any, next: any) => {
  const oauthState = getOAuthState(req);

  if (!req.query.state || req.query.state !== oauthState) {
    clearOAuthState(req);

    const error: any = new Error("Invalid OAuth2 state parameter");
    error.status = 400;

    return next(error);
  }

  clearOAuthState(req);

  if (req.query.code && req.query.code !== "") {
    // On successfully obtaining a token, the redirect should go back to ourselves.
    // Note: This *must not* include any query string.
    const redirect = `${req.protocol}://${req.get("host")}${req.originalUrl}`
      .replace("https://", "").split("?", 1)[0];
    accessTokenRequest(req, redirect)
      .then((result) => {
        res.cookie(COOKIE_ID_TOKEN, result.id_token,
          {
            httpOnly: true,
            maxAge: result.expires_in * 1000,
            secure : config.get("security.secure_auth_cookie_enabled"),
          });
        res.cookie(COOKIE_ACCESS_TOKEN, result.access_token,
          {
            httpOnly: true,
            maxAge: result.expires_in * 1000,
            secure : config.get<boolean>("security.secure_auth_cookie_enabled"),
          });
        // Redirect to / (index)
        res.redirect(302, "/");
      })
      .catch((err) => next(err));
  } else {
    throw new Error("Unable to obtain access token - no OAuth2 code provided");
  }
};

/* tslint:disable:no-default-export */
export default router.get("/oauth2redirect", oauth2redirect);
