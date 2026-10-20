process.env.TS_NODE_FAST = 'true';

const config = require('config');
const propertiesVolume = require('@hmcts/properties-volume');

const SESSION_KEYS_PATH = 'secrets.ccd.session-keys';
const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 500;

// ponytail: the Key Vault CSI volume can still be mounting when this process starts, so retry
// briefly instead of crashing on the first missed read. Ceiling: 10 attempts (~5s) before giving
// up and letting getSessionKeys() throw its normal configuration error.
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  propertiesVolume.addTo(config);
  if (config.has(SESSION_KEYS_PATH) || attempt === MAX_ATTEMPTS) {
    break;
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, RETRY_DELAY_MS);
}

require('ts-node/register');
require('./src/main/server');
