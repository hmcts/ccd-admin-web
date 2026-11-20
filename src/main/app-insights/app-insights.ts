import config from "config";
import { setup, defaultClient, start } from "applicationinsights";

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
    setup(appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, null)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true);
    defaultClient.context.tags[defaultClient.context.keys.cloudRole] = appInsightsRoleName;
    defaultClient.addTelemetryProcessor(fineGrainedSampling);
    start();
  }
};

export default enableAppInsights;
