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
  const APPLICATION_HOST = "admin.example.test";

  let config;
  let request;
  let response;
  let logout;

  beforeEach(() => {
    config = { get: sinon.stub() };
    config.get.withArgs("idam.web_public_url").returns(IDAM_URL);
    request = mockReq({
      protocol: "https",
      cookies: {
        [COOKIE_ACCESS_TOKEN]: ACCESS_TOKEN,
        [COOKIE_ID_TOKEN]: ID_TOKEN,
      },
      session: {},
    });
    request.get = sinon.stub();
    request.get.withArgs("host").returns(APPLICATION_HOST);
    response = mockRes();
    logout = proxyquire.noCallThru()("../../main/routes/logout", {
      "config": config,
    }).logout;
  });

  function redirectUrl(): URL {
    expect(response.redirect).to.be.calledOnce;
    expect(response.redirect.firstCall.args[0]).to.equal(302);
    return new URL(response.redirect.firstCall.args[1]);
  }

  function expectLocalSessionCleared(): void {
    expect(response.clearCookie).to.be.calledWith(COOKIE_ACCESS_TOKEN);
    expect(response.clearCookie).to.be.calledWith(COOKIE_ID_TOKEN);
    expect(request.session).to.be.null;
    expect(response.clearCookie).to.be.calledBefore(response.redirect);
  }

  it("should redirect the browser through IdAM logout and return to the application root", () => {
    logout(request, response);

    const url = redirectUrl();
    expect(url.origin).to.equal(IDAM_URL);
    expect(url.pathname).to.equal("/o/endSession");
    expect(url.searchParams.get("token")).to.equal(ID_TOKEN);
    expect(url.searchParams.get("post_logout_redirect_uri")).to.equal(`https://${APPLICATION_HOST}/`);
    expect([...url.searchParams.keys()]).to.have.members(["token", "post_logout_redirect_uri"]);
    expect(config.get).to.be.calledOnceWith("idam.web_public_url");
    expectLocalSessionCleared();
  });

  it("should URL-encode the ID token", () => {
    request.cookies[COOKIE_ID_TOKEN] = "token+with/reserved?characters=&";

    logout(request, response);

    expect(redirectUrl().searchParams.get("token")).to.equal(request.cookies[COOKIE_ID_TOKEN]);
  });

  it("should clear local authentication and visit IdAM when the ID token is missing", () => {
    delete request.cookies[COOKIE_ID_TOKEN];

    logout(request, response);

    expect(redirectUrl().searchParams.has("token")).to.be.false;
    expectLocalSessionCleared();
  });

  it("should visit IdAM logout when cookies are missing", () => {
    delete request.cookies;

    logout(request, response);

    expect(redirectUrl().origin).to.equal(IDAM_URL);
    expect(redirectUrl().searchParams.has("token")).to.be.false;
    expectLocalSessionCleared();
  });

  it("should preserve the application protocol and port in the return URL", () => {
    request.protocol = "http";
    request.get.withArgs("host").returns("localhost:3100");

    logout(request, response);

    expect(redirectUrl().searchParams.get("post_logout_redirect_uri")).to.equal("http://localhost:3100/");
  });

  it("should redirect using the real configuration module", () => {
    const logoutWithRealConfig = proxyquire.noCallThru()("../../main/routes/logout", {}).logout;

    logoutWithRealConfig(request, response);

    expect(redirectUrl().pathname).to.equal("/o/endSession");
    expectLocalSessionCleared();
  });
});
