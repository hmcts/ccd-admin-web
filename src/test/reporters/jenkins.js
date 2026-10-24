import Mocha from "mocha";
import Mochawesome from "mochawesome";

function JenkinsReporter(runner, options) {
  const reporterOptions = options.reporterOptions || {};

  this.mochawesome = new Mochawesome(runner, options);
  this.xunit = new Mocha.reporters.XUnit(runner, {
    reporterOptions: {
      output: reporterOptions.junitOutput,
      suiteName: reporterOptions.suiteName,
    },
  });

  this.done = (failures, exit) => {
    this.xunit.done(failures, () => this.mochawesome.done(failures, exit));
  };
}

module.exports = JenkinsReporter;
