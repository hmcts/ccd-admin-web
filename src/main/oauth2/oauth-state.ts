import { randomBytes } from "crypto";
import NodeCache from "node-cache";

export const OAUTH_SESSION_ID_KEY = "oauthSessionId";
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

// Only transactions issued by this process are accepted. A restart fails closed;
// multiple instances require affinity or a shared store with atomic consumption.
const pendingStates = new NodeCache({
  stdTTL: OAUTH_STATE_TTL_MS / 1000,
  checkperiod: 60,
  maxKeys: 10000,
  useClones: false,
});

export const generateOAuthState = () => randomBytes(32).toString("hex");

export const setOAuthState = (req) => {
  const now = Date.now();
  if (!req.session) {
    req.session = {};
  }

  // Keep the browser binding stable so starting or completing one login does
  // not overwrite the binding of another outstanding login in the same browser.
  const sessionId = req.session[OAUTH_SESSION_ID_KEY] || generateOAuthState();
  req.session[OAUTH_SESSION_ID_KEY] = sessionId;

  const state = generateOAuthState();
  pendingStates.set(state, { sessionId, expiresAt: now + OAUTH_STATE_TTL_MS });

  return state;
};

export const consumeOAuthState = (req, state: unknown): boolean => {
  if (typeof state !== "string" || !state) {
    return false;
  }

  const transaction = pendingStates.get<{ sessionId: string; expiresAt: number }>(state);
  if (!transaction || transaction.sessionId !== req.session?.[OAUTH_SESSION_ID_KEY]) {
    return false;
  }

  // Consume synchronously before the token exchange, even if the exchange fails.
  // Replaying an earlier signed session cookie cannot restore this transaction.
  pendingStates.del(state);

  return transaction.expiresAt > Date.now();
};
