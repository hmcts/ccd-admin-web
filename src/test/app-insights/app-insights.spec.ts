import { expect } from "chai";
import enableAppInsights from "../../main/app-insights/app-insights";

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
