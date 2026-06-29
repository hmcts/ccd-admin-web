import * as express from "express";
import * as config from "config";
import { accessTokenRequest } from "../oauth2/access-token-request";

export const COOKIE_ACCESS_TOKEN = "accessToken";
const router = express.Router();

export const oauth2redirect = (req, res, next) => {
  const expectedState = req.session && req.session.oauthState;
  const rawState = req.query && req.query.state;
  const receivedState = Array.isArray(rawState) ? rawState[0] : rawState;

  if (!expectedState || !receivedState || expectedState !== receivedState) {
    if (req.session) {
      delete req.session.oauthState;
    }
    return next({
      message: "Invalid state parameter - possible CSRF attack",
      status: 400,
    });
  }
  // Single-use nonce: consume immediately after successful validation.
  delete req.session.oauthState;

  if (!req.query.code) {
    return next({
      message: "Unable to obtain access token - no OAuth2 code provided",
      status: 400,
    });
  } else {
    // On successfully obtaining a token, the redirect should go back to ourselves.
    // Note: This *must not* include any query string.
    req.query.redirect_uri = `${req.protocol}://${req.get("host")}${req.originalUrl}`
      .replace("https://", "").split("?", 1)[0];
    accessTokenRequest(req)
      .then((result) => {
        res.cookie(COOKIE_ACCESS_TOKEN, result.access_token,
          {
            httpOnly: true,
            maxAge: result.expires_in * 1000,
            secure : config.get("security.secure_auth_cookie_enabled"),
          });
        // Redirect to / (index)
        res.redirect(302, "/");
      })
      .catch((err) => next(err));
  }
};

/* tslint:disable:no-default-export */
export default router.get("/oauth2redirect", oauth2redirect);
