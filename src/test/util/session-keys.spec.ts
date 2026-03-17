import * as chai from "chai";
import * as proxyquire from "proxyquire";

const expect = chai.expect;

describe("getSessionKeys", () => {
  it("should return configured session keys", () => {
    const { getSessionKeys } = proxyquire("../../main/util/session-keys", {
      config: {
        get: () => ["session-key-1", "session-key-2"],
      },
    });

    expect(getSessionKeys()).to.deep.equal(["session-key-1", "session-key-2"]);
  });

  it("should fail when session keys are missing", () => {
    const { getSessionKeys } = proxyquire("../../main/util/session-keys", {
      config: {
        get: () => {
          throw new Error("missing");
        },
      },
    });

    expect(() => getSessionKeys())
      .to.throw("Session signing keys must be configured at secrets.ccd.session-keys as a JSON array with at least two non-empty signing keys.");
  });

  it("should fail when fewer than two session keys are configured", () => {
    const { getSessionKeys } = proxyquire("../../main/util/session-keys", {
      config: {
        get: () => ["session-key-1"],
      },
    });

    expect(() => getSessionKeys())
      .to.throw("Session signing keys must be configured at secrets.ccd.session-keys as a JSON array with at least two non-empty signing keys.");
  });

  it("should fail when any configured session key is blank", () => {
    const { getSessionKeys } = proxyquire("../../main/util/session-keys", {
      config: {
        get: () => ["session-key-1", "   "],
      },
    });

    expect(() => getSessionKeys())
      .to.throw("Session signing keys must be configured at secrets.ccd.session-keys as a JSON array with at least two non-empty signing keys.");
  });
});
