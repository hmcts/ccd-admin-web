import * as config from "config";

const SESSION_KEYS_CONFIG_PATH = "secrets.ccd.session-keys";
const SESSION_KEYS_ERROR = "Session signing keys must be configured at secrets.ccd.session-keys as a JSON array with at least two non-empty signing keys.";

export const getSessionKeys = (): string[] => {
  let sessionKeys: string[];

  try {
    sessionKeys = config.get<string[]>(SESSION_KEYS_CONFIG_PATH);
  } catch (error) {
    throw new Error(SESSION_KEYS_ERROR);
  }

  if (!Array.isArray(sessionKeys)
    || sessionKeys.length < 2
    || sessionKeys.some((key) => typeof key !== "string" || key.trim().length === 0)) {
    throw new Error(SESSION_KEYS_ERROR);
  }

  return sessionKeys;
};
