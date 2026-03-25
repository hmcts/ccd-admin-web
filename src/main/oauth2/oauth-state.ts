import { randomBytes } from "crypto";

export const OAUTH_STATE_SESSION_KEY = "oauthState";

export const generateOAuthState = () => randomBytes(32).toString("hex");

export const setOAuthState = (req, state = generateOAuthState()) => {
  if (!req.session) {
    req.session = {};
  }

  req.session[OAUTH_STATE_SESSION_KEY] = state;

  return state;
};

export const getOAuthState = (req) => req.session && req.session[OAUTH_STATE_SESSION_KEY];

export const clearOAuthState = (req) => {
  if (req.session) {
    delete req.session[OAUTH_STATE_SESSION_KEY];
  }
};
