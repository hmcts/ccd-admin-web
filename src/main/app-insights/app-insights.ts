import config from "config";
import appInsights from "applicationinsights";

const enabled = config.get<boolean>("appInsights.enabled");

export function enableAppInsights(): void {
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
    appInsights.start();
  }
};

export default enableAppInsights;
