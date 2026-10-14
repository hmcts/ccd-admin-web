const config = require("config");
const appInsights = require("applicationinsights");

const enabled = config.get("appInsights.enabled");

function fineGrainedSampling(envelope) {
  if (
    ["RequestData", "RemoteDependencyData"].includes(envelope.data.baseType) &&
    envelope.data.baseData.name.includes("/health")
  ) {
    envelope.sampleRate = 1;
  }

  return true;
}

const enableAppInsights = () => {
  if (enabled) {
    const appInsightsConnectionString = config.get("secrets.ccd.app-insights-connection-string");
    const appInsightsRoleName = config.get("appInsights.roleName");
    process.env.OTEL_SERVICE_NAME = appInsightsRoleName;
    appInsights.setup(appInsightsConnectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true);
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = appInsightsRoleName;
    appInsights.defaultClient.addTelemetryProcessor(fineGrainedSampling);
    appInsights.start();
  }
};

module.exports = enableAppInsights;
