process.env.TS_NODE_FAST = 'true';
require('ts-node/register');
require('./src/main/server');
require('@hmcts/properties-volume').addTo(require('config'))