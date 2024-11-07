import { expect } from 'chai';

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
