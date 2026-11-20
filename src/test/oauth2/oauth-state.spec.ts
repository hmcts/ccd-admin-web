import { expect } from "chai";
import sinon from "sinon";
import {
  consumeOAuthState,
  OAUTH_STATE_TTL_MS,
  setOAuthState,
} from "../../main/oauth2/oauth-state";

describe("OAuth state transactions", () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    clock.restore();
  });

  it("should generate distinct cryptographically random states", () => {
    const req = {};
    const first = setOAuthState(req);
    const second = setOAuthState(req);

    expect(first).to.match(/^[a-f0-9]{64}$/);
    expect(second).to.match(/^[a-f0-9]{64}$/);
    expect(first).not.to.equal(second);
  });

  it("should reject replay even when the original session cookie is restored", () => {
    const req = { session: {} };
    const state = setOAuthState(req);
    const originalSession = JSON.parse(JSON.stringify(req.session));

    expect(consumeOAuthState(req, state)).to.be.true;
    expect(consumeOAuthState({ session: originalSession }, state)).to.be.false;
  });

  it("should accept a transaction just before it expires", () => {
    const req = {};
    const state = setOAuthState(req);
    clock.tick(OAUTH_STATE_TTL_MS - 1);

    expect(consumeOAuthState(req, state)).to.be.true;
  });

  it("should reject a transaction at its expiry even with the original session", () => {
    const req = {};
    const state = setOAuthState(req);
    clock.tick(OAUTH_STATE_TTL_MS);

    expect(consumeOAuthState(req, state)).to.be.false;
  });

  it("should not extend an earlier transaction's lifetime when starting another login", () => {
    const req = {};
    const first = setOAuthState(req);
    clock.tick(OAUTH_STATE_TTL_MS / 2);
    const second = setOAuthState(req);
    clock.tick(OAUTH_STATE_TTL_MS / 2);

    expect(consumeOAuthState(req, first)).to.be.false;
    expect(consumeOAuthState(req, second)).to.be.true;
  });

  it("should preserve parallel logins across independent requests with the same session", () => {
    const req = { session: {} };
    const first = setOAuthState(req);
    const otherTab = { session: JSON.parse(JSON.stringify(req.session)) };
    const second = setOAuthState(otherTab);

    expect(consumeOAuthState(req, second)).to.be.true;
    expect(consumeOAuthState(otherTab, first)).to.be.true;
  });

  it("should reject invalid input without consuming pending transactions", () => {
    const req = {};
    const first = setOAuthState(req);
    const second = setOAuthState(req);

    for (const invalid of [undefined, null, "", "unknown", [first], { state: first }]) {
      expect(consumeOAuthState(req, invalid)).to.be.false;
    }

    expect(consumeOAuthState(req, first)).to.be.true;
    expect(consumeOAuthState(req, second)).to.be.true;
  });

  it("should reject missing or unrelated sessions without consuming the owner's state", () => {
    const owner = {};
    const state = setOAuthState(owner);
    const otherBrowser = {};
    setOAuthState(otherBrowser);

    expect(consumeOAuthState({}, state)).to.be.false;
    expect(consumeOAuthState({ session: null }, state)).to.be.false;
    expect(consumeOAuthState(otherBrowser, state)).to.be.false;
    expect(consumeOAuthState(owner, state)).to.be.true;
  });
});
