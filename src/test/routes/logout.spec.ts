import * as chai from "chai";
import { COOKIE_ACCESS_TOKEN } from "../../main/routes/oauth2redirect";
import * as fetchMock from "fetch-mock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as sinonExpressMock from "sinon-express-mock";

const expect = chai.expect;
chai.use(sinonChai);

describe("logout", () => {
  const CLIENT_ID = "ccd_admin";
  const CLIENT_SECRET = "abc123def456";
  const ACCESS_TOKEN = "eycdjc7hf3478g4f37";
  const LOGOUT_ENDPOINT = "http://localhost/session/:token";

  let config;
  let request;
  let response;
  let next;
  let fetch;
  let logout;

  beforeEach(() => {
    config = {
      get: sinon.stub(),
    };
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("idam.oauth2.client_secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.logout_endpoint").returns(LOGOUT_ENDPOINT);

    request = sinonExpressMock.mockReq({
      cookies: {
        [COOKIE_ACCESS_TOKEN]: ACCESS_TOKEN,
      },
      session: {},
    });
    response = sinonExpressMock.mockRes();
    next = sinon.stub();

    fetch = fetchMock.sandbox().delete(LOGOUT_ENDPOINT.replace(":token", ACCESS_TOKEN), {});

    logout = proxyquire("../../main/routes/logout", {
      "config": config,
      "node-fetch": fetch,
    }).logout;
  });

  it("should call IdAM OAuth 2 logout endpoint with JWT token, and redirect to IdAM login page", (done) => {
    response.redirect.callsFake(() => {
      try {
        expect(fetch.called(LOGOUT_ENDPOINT.replace(":token", ACCESS_TOKEN))).to.be.true;
        expect(fetch.lastOptions().headers.Authorization).to.equal("Basic "
          + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"));
        expect(next).not.to.be.called;
        expect(response.clearCookie).to.be.calledWith(COOKIE_ACCESS_TOKEN);
        expect(request.session).to.be.null;
        expect(response.redirect).to.be.calledWith(302, "/");
        done();
      } catch (e) {
        done(e);
      }
    });

    logout(request, response, next);

    expect(config.get).to.be.calledWith("idam.oauth2.client_id");
    expect(config.get).to.be.calledWith("idam.oauth2.client_secret");
    expect(config.get).to.be.calledWith("idam.oauth2.logout_endpoint");
  });

  it("should return 400 error when cookies missing", () => {
    request = sinonExpressMock.mockReq({});

    logout(request, response, next);

    expect(response.redirect).not.to.be.called;
    expect(next).to.be.calledWith({
      error: "No auth token",
      message: "No auth token to log out",
      status: 400,
    });
  });

  it("should return 400 error when cookie `accessToken` is missing", () => {
    request = sinonExpressMock.mockReq({
      cookies: {},
    });

    logout(request, response, next);

    expect(response.redirect).not.to.be.called;
    expect(next).to.be.calledWith({
      error: "No auth token",
      message: "No auth token to log out",
      status: 400,
    });
  });
});
