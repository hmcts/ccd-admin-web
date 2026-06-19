process.env.TS_NODE_FAST = 'true';
require('@hmcts/properties-volume').addTo(require('config'))
require('./src/main/server');
