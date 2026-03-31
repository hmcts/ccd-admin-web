import { expect } from "chai";
import enableAppInsights from "./app-insights";

describe("Application insights", () => {
  it("should initialize properly", () => {
    expect(enableAppInsights).to.not.throw();
  });
});
