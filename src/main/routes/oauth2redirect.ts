import * as express from "express";
import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import { accessTokenRequest } from "../oauth2/access-token-request";

export const COOKIE_ACCESS_TOKEN = "accessToken";
const TEMP_FLOW_HEADER = "X-OAuth2-Flow-Step";
const router = express.Router();
const logger = Logger.getLogger(__filename);

const setTempFlowStep = (res, step) => res.set(TEMP_FLOW_HEADER, step);

export const oauth2redirect = (req, res, next) => {
  const expectedState = req.session && req.session.oauthState;
  const rawState = req.query && req.query.state;
  const receivedState = Array.isArray(rawState) ? rawState[0] : rawState;

  logger.info("[TEMP oauth2redirect] Callback received", {
    hasCode: Boolean(req.query && req.query.code),
    hasExpectedState: Boolean(expectedState),
    hasReceivedState: Boolean(receivedState),
    method: req.method,
    path: req.path,
  });

  if (!expectedState || !receivedState || expectedState !== receivedState) {
    setTempFlowStep(res, "state-validation-failed");
    logger.warn("[TEMP oauth2redirect] State validation failed", {
      expectedStatePresent: Boolean(expectedState),
      receivedStatePresent: Boolean(receivedState),
      statesMatch: expectedState === receivedState,
    });
    if (req.session) {
      delete req.session.oauthState;
    }
    return next({
      message: "Invalid state parameter - possible CSRF attack",
      status: 400,
    });
  }

  logger.info("[TEMP oauth2redirect] State validation succeeded");
  // Single-use nonce: consume immediately after successful validation.
  delete req.session.oauthState;

  if (!req.query.code) {
    setTempFlowStep(res, "missing-oauth2-code");
    logger.warn("[TEMP oauth2redirect] Missing OAuth2 code in callback query");
    return next({
      message: "Unable to obtain access token - no OAuth2 code provided",
      status: 400,
    });
  } else {
    // On successfully obtaining a token, the redirect should go back to ourselves.
    // Note: This *must not* include any query string.
    req.query.redirect_uri = `${req.protocol}://${req.get("host")}${req.originalUrl}`
      .replace("https://", "").split("?", 1)[0];

    setTempFlowStep(res, "token-exchange-started");
    logger.info("[TEMP oauth2redirect] Exchanging authorization code for token", {
      redirectUri: req.query.redirect_uri,
    });

    accessTokenRequest(req)
      .then((result) => {
        logger.info("[TEMP oauth2redirect] Token exchange succeeded", {
          expiresInSeconds: result.expires_in,
        });
        res.cookie(COOKIE_ACCESS_TOKEN, result.access_token,
          {
            httpOnly: true,
            maxAge: result.expires_in * 1000,
            secure : config.get("security.secure_auth_cookie_enabled"),
          });
        setTempFlowStep(res, "token-cookie-set-redirect-home");
        logger.info("[TEMP oauth2redirect] Access token cookie set; redirecting to home");
        // Redirect to / (index)
        res.redirect(302, "/");
      })
      .catch((err) => {
        setTempFlowStep(res, "token-exchange-failed");
        logger.error("[TEMP oauth2redirect] Token exchange failed", err);
        next(err);
      });
  }
};

/* tslint:disable:no-default-export */
export default router.get("/oauth2redirect", oauth2redirect);
