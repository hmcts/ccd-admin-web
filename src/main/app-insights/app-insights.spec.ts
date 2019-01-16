const expect = chai.expect;

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
