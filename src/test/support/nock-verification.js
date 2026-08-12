const nock = require("nock");
const unusedMocks = [];

afterEach(function() {
  const pendingMocks = nock.pendingMocks();
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
