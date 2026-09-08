const Mocha = require("mocha");
const Mochawesome = require("mochawesome");

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
