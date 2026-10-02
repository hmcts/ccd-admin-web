import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

const expect = chai.expect;
chai.use(sinonChai);

describe("App Insights", () => {
  const instrumentationKey = "instrumentation-key";
  const roleName = "ccd-admin-web";
  const cloudRoleKey = "ai.cloud.role";

  let appInsights;
  let config;
  let setupChain;

  const loadAppInsights = (enabled: boolean) => {
    config.get.withArgs("appInsights.enabled").returns(enabled);
    config.get.withArgs("secrets.ccd.AppInsightsInstrumentationKey").returns(instrumentationKey);
    config.get.withArgs("appInsights.roleName").returns(roleName);

    return proxyquire.noCallThru()("../../main/app-insights/app-insights", {
      applicationinsights: appInsights,
      config,
    });
  };

  beforeEach(() => {
    config = {
      get: sinon.stub(),
    };

    setupChain = {
      setAutoCollectConsole: sinon.stub(),
      setAutoCollectDependencies: sinon.stub(),
      setAutoCollectExceptions: sinon.stub(),
      setAutoCollectPerformance: sinon.stub(),
      setAutoCollectRequests: sinon.stub(),
      setAutoDependencyCorrelation: sinon.stub(),
      setSendLiveMetrics: sinon.stub(),
      setUseDiskRetryCaching: sinon.stub(),
    };

    Object.keys(setupChain).forEach((method) => setupChain[method].returns(setupChain));

    appInsights = {
      defaultClient: {
        addTelemetryProcessor: sinon.stub(),
        context: {
          keys: {cloudRole: cloudRoleKey},
          tags: {},
        },
      },
      setup: sinon.stub().returns(setupChain),
      start: sinon.stub(),
    };
  });

  it("does not initialise App Insights when it is disabled", () => {
    const enableAppInsights = loadAppInsights(false);

    enableAppInsights();

    expect(appInsights.setup).not.to.have.been.called;
    expect(appInsights.start).not.to.have.been.called;
  });

  describe("when enabled", () => {
    let telemetryProcessor;

    beforeEach(() => {
      const enableAppInsights = loadAppInsights(true);
      enableAppInsights();
      telemetryProcessor = appInsights.defaultClient.addTelemetryProcessor.firstCall.args[0];
    });

    it("configures and starts App Insights", () => {
      expect(appInsights.setup).to.have.been.calledWith(instrumentationKey);
      Object.keys(setupChain).forEach((method) => expect(setupChain[method]).to.have.been.calledWith(true));
      expect(appInsights.defaultClient.context.tags[cloudRoleKey]).to.equal(roleName);
      expect(appInsights.defaultClient.addTelemetryProcessor).to.have.been.calledOnce;
      expect(appInsights.start).to.have.been.calledOnce;
    });

    it("retains health request and dependency telemetry", () => {
      ["RequestData", "RemoteDependencyData"].forEach((baseType) => {
        const envelope = {
          data: {
            baseData: {name: "GET /health/readiness"},
            baseType,
          },
        };

        expect(telemetryProcessor(envelope)).to.be.true;
        expect(envelope).to.have.property("sampleRate", 1);
      });
    });

    it("does not change non-health request telemetry", () => {
      const envelope = {
        data: {
          baseData: {name: "GET /definitions"},
          baseType: "RequestData",
        },
      };

      expect(telemetryProcessor(envelope)).to.be.true;
      expect(envelope).not.to.have.property("sampleRate");
    });

    it("does not inspect unrelated telemetry as a request", () => {
      const envelope = {
        data: {
          baseData: {},
          baseType: "ExceptionData",
        },
      };

      expect(telemetryProcessor(envelope)).to.be.true;
      expect(envelope).not.to.have.property("sampleRate");
    });
  });
});
