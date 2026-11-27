import { expect, use } from "chai";
import { COOKIE_ACCESS_TOKEN, COOKIE_ID_TOKEN } from "../../main/routes/oauth2redirect";
import proxyquire from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { mockReq, mockRes } from "sinon-express-mock";

use(sinonChai);

describe("logout", () => {
  const ACCESS_TOKEN = "access-token-value";
  const ID_TOKEN = "id-token-value";
  const IDAM_URL = "https://idam.example.test";
  const CLIENT_ID = "ccd_admin";
  const CLIENT_SECRET = "client-secret-value";

  let config;
  let request;
  let response;
  let next;
  let fetch;
  let logout;

  beforeEach(() => {
    config = { get: sinon.stub() };
    config.get.withArgs("idam.web_public_url").returns(IDAM_URL);
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    request = mockReq({
      cookies: {
        [COOKIE_ACCESS_TOKEN]: ACCESS_TOKEN,
        [COOKIE_ID_TOKEN]: ID_TOKEN,
      },
      session: { adminWebAuthorization: { canImport: true }, oauthState: "old-state" },
    });
    response = mockRes();
    next = sinon.stub();
    fetch = sinon.stub().resolves({ status: 204 });
    logout = proxyquire.noCallThru()("../../main/routes/logout", {
      "config": config,
      "../util/fetch": { fetch },
    }).logout;
  });

  function expectLocalSessionCleared(): void {
    expect(response.clearCookie).to.be.calledWith(COOKIE_ACCESS_TOKEN);
    expect(response.clearCookie).to.be.calledWith(COOKIE_ID_TOKEN);
    expect(request.session).to.deep.equal({ forceLogin: true });
  }

  it("should complete IdAM logout with a 204 and redirect the browser to the application root", async () => {
    await logout(request, response, next);

    expect(fetch).to.be.calledOnce;
    const [url, options] = fetch.firstCall.args;
    const logoutUrl = new URL(url);
    expect(logoutUrl.origin).to.equal(IDAM_URL);
    expect(logoutUrl.pathname).to.equal("/o/endSession");
    expect(logoutUrl.searchParams.get("token")).to.equal(ID_TOKEN);
    expect(logoutUrl.searchParams.has("post_logout_redirect_uri")).to.be.false;
    expect(options.method).to.equal("GET");
    expect(options.headers.Authorization).to.equal(
      `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    );
    expect(options.signal).to.be.instanceOf(AbortSignal);
    expect(response.redirect).to.be.calledOnce;
    expect(response.redirect).to.be.calledWith(302, "/");
    expect(next).not.to.be.called;
    expectLocalSessionCleared();
  });

  it("should wait for IdAM to finish before redirecting the browser", async () => {
    let finishLogout!: (value: { status: number }) => void;
    fetch.returns(new Promise((resolve) => { finishLogout = resolve; }));

    const pendingLogout = logout(request, response, next);

    expectLocalSessionCleared();
    expect(response.redirect).not.to.be.called;
    finishLogout({ status: 204 });
    await pendingLogout;
    expect(response.redirect).to.be.calledOnce;
    expect(response.redirect).to.be.calledWith(302, "/");
  });

  it("should URL-encode the ID token", async () => {
    request.cookies[COOKIE_ID_TOKEN] = "token+with/reserved?characters=&";

    await logout(request, response, next);

    expect(new URL(fetch.firstCall.args[0]).searchParams.get("token")).to.equal(request.cookies[COOKIE_ID_TOKEN]);
  });

  it("should clear local authentication and redirect when the ID token is missing", async () => {
    delete request.cookies[COOKIE_ID_TOKEN];

    await logout(request, response, next);

    expect(fetch).not.to.be.called;
    expect(response.redirect).to.be.calledOnce;
    expect(response.redirect).to.be.calledWith(302, "/");
    expectLocalSessionCleared();
  });

  it("should clear local authentication and redirect when cookies are missing", async () => {
    delete request.cookies;

    await logout(request, response, next);

    expect(fetch).not.to.be.called;
    expect(response.redirect).to.be.calledOnce;
    expect(response.redirect).to.be.calledWith(302, "/");
    expectLocalSessionCleared();
  });

  it("should report IdAM failure without exposing tokens and still clear local authentication", async () => {
    fetch.rejects(new Error(`Request failed for token=${ID_TOKEN}`));

    await logout(request, response, next);

    expect(next).to.be.calledOnce;
    expect(next).to.be.calledWith({ status: 502, message: "Unable to complete IdAM logout" });
    expect(response.redirect).not.to.be.called;
    expectLocalSessionCleared();
  });
});
