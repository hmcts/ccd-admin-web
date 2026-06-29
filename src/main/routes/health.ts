import * as express from "express";
import * as config from "config";
import * as healthcheck from "@hmcts/nodejs-healthcheck";

const env = process.env.NODE_ENV || "development";

process.env.PACKAGES_ENVIRONMENT = env;
process.env.PACKAGES_PROJECT = "ccd-admin-web";
process.env.PACKAGES_NAME = "admin-web";

const healthCheckRouter = express.Router();

const healthCheckConfig = {
  checks: {
    "hmcts-access": basicHealthCheck("idam.hmcts_access_url"),
    "s2s": basicHealthCheck("idam.s2s_url"),
  },
};

export default express.Router().use(healthCheckRouter);
healthcheck.addTo(healthCheckRouter, healthCheckConfig);

function basicHealthCheck(serviceName: string) {
  const options: any = {
    deadline: 15000,
    timeout: 5000,
  };
  return healthcheck.web(url(serviceName) + "/health", options);
}

function url(serviceUrlConfigKey: string): string {
    return config.get<string>(serviceUrlConfigKey);
}
