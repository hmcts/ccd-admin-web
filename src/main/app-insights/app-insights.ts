const config = require("config");
const appInsights = require("applicationinsights");

const enabled = config.get("appInsights.enabled");

const enableAppInsights = () => {
  if (enabled) {
    const appInsightsKey = config.get("secrets.ccd.AppInsightsInstrumentationKey");
    const appInsightsRoleName = config.get("appInsights.roleName");
    appInsights.setup(appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true);
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = appInsightsRoleName;
    appInsights.defaultClient.config.samplingPercentage = 1;
    appInsights.start();
  }
};

module.exports = enableAppInsights;
