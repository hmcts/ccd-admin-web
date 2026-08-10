const nock = require("nock");
const unusedMocks = [];

afterEach(function() {
  const optionalAuthenticationMocks = [
    "GET http://localhost:4451/api/idam/adminweb/authorization",
  ];
  const pendingMocks = nock.pendingMocks()
    .filter((pendingMock) => !optionalAuthenticationMocks.includes(pendingMock));
  nock.cleanAll();

  if (pendingMocks.length > 0) {
    unusedMocks.push(`${this.currentTest.fullTitle()}:\n${pendingMocks.join("\n")}`);
  }
});

after(() => {
  if (unusedMocks.length > 0) {
    throw new Error(`Not all expected HTTP calls were made:\n${unusedMocks.join("\n\n")}`);
  }
});
