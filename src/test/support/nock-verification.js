const nock = require("nock");

afterEach(function() {
  const optionalAuthenticationMocks = [
    "GET http://localhost:4451/api/idam/adminweb/authorization",
  ];
  const pendingMocks = nock.pendingMocks()
    .filter((pendingMock) => !optionalAuthenticationMocks.includes(pendingMock));
  const negativeCallExpectation =
    /(?:not authorized|unauthorized|without (?:required )?authorized|without call|should not (?:be )?call|not called)/i;
  const expectsMocksToRemainUnused = negativeCallExpectation.test(this.currentTest.fullTitle());
  nock.cleanAll();

  if (pendingMocks.length > 0 && !expectsMocksToRemainUnused) {
    throw new Error(`Not all expected HTTP calls were made:\n${pendingMocks.join("\n")}`);
  }
});
