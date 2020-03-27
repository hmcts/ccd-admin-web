process.env.TS_NODE_FAST = 'true';
require('@hmcts/properties-volume').addTo(require('config'))
require('ts-node/register');
require('./src/main/server');
