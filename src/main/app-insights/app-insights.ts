import config from "config";
import appInsights from "applicationinsights";

const enabled = config.get<boolean>("appInsights.enabled");

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
    const appInsightsKey = config.get<string>("secrets.ccd.AppInsightsInstrumentationKey");
    const appInsightsRoleName = config.get<string>("appInsights.roleName");
    appInsights.setup(appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, null)
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

export default enableAppInsights;
