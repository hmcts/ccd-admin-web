import * as express from "express";
import { accessTokenRequest } from "../oauth2/access-token-request";

export const COOKIE_ACCESS_TOKEN = "accessToken";
const router = express.Router();

export const oauth2redirect = (req, res, next) => {
  if (req.query.code) {
    // On successfully obtaining a token, the redirect should go back to ourselves.
    // Note: This *must not* include any query string.
    req.query.redirect_uri = `${req.protocol}://${req.get("host")}${req.originalUrl}`
      .replace("https://", "").split("?", 1)[0];
    accessTokenRequest(req)
      .then((result) => {
        res.cookie(COOKIE_ACCESS_TOKEN, result.access_token, { httpOnly: true, maxAge: result.expires_in * 1000 });
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
