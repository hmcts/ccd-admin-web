import { expect, use } from "chai";
import proxyquire from "proxyquire";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { mockReq } from "sinon-express-mock";
import url from "url";

use(sinonChai);

describe("Access Token Request", () => {
  const CLIENT_ID = "ccd_admin";
  const CLIENT_SECRET = "abc123def456";
  const HMCTS_ACCESS_URL = "http://localhost:1234";
  const TOKEN_ENDPOINT = `${HMCTS_ACCESS_URL}/o/token`;
  const REDIRECT_URN = "localhost/redirect/to";
  const REDIRECT_URL = "https://localhost/redirect/to";
  const REDIRECT_URL_WITH_PORT = "https://localhost:3501/redirect/to";
  const DISALLOWED_URI = "https://attacker.com/steal";
  const AUTH_CODE = "xyz789";
  const REDIRECT_ALLOWLIST = "localhost,127.0.0.1";

  const REQUEST = mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URN,
    },
  });
  const RESPONSE = {
    access_token: "q1w2e3r4t5y6",
    expires_in: 3600,
    token_type: "Bearer",
  };

  let config;
  let fetchStub: sinon.SinonStub;
  let accessTokenRequest;

  beforeEach(() => {
    config = {
      get: sinon.stub(),
    };

    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.web_public_url").returns(HMCTS_ACCESS_URL);
    config.get.withArgs("idam.oauth2.redirect_uri_allowlist").returns(REDIRECT_ALLOWLIST);

    fetchStub = sinon.stub().resolves({
      status: 200,
      json: () => Promise.resolve(RESPONSE),
    });

    accessTokenRequest = proxyquire("../../main/oauth2/access-token-request", {
      "config": config,
      "../util/fetch": { fetch: fetchStub },
    }).accessTokenRequest;
  });

  it("should call the IdAM OAuth 2 token endpoint with the correct headers and query string parameters", async () => {
    const result = await accessTokenRequest(REQUEST, REDIRECT_URL);

    expect(fetchStub).to.have.been.calledOnce;
    const [requestedUri, options] = fetchStub.firstCall.args;
    const requestedUrl = url.parse(requestedUri, true);
    expect(`${requestedUrl.protocol}//${requestedUrl.host}${requestedUrl.pathname}`).to.equal(TOKEN_ENDPOINT);
    expect(options).to.deep.equal({
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });
    expect(requestedUrl.query).to.include({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: AUTH_CODE,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URL,
    });
    expect(result).to.deep.equal(RESPONSE);
  });

  it("should add `https://` prefix", async () => {
    await accessTokenRequest(REQUEST, REDIRECT_URN);

    const requestedUrl = url.parse(fetchStub.firstCall.args[0], true);
    expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
  });

  it("should allow redirect URIs with an allowed hostname and port", async () => {
    await accessTokenRequest(REQUEST, REDIRECT_URL_WITH_PORT);

    const requestedUrl = url.parse(fetchStub.firstCall.args[0], true);
    expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL_WITH_PORT);
  });

  it("should use the explicit redirect URI instead of the query parameter", async () => {
    const request = mockReq({ query: { code: AUTH_CODE, redirect_uri: DISALLOWED_URI } });

    await accessTokenRequest(request, REDIRECT_URL);

    const requestedUrl = url.parse(fetchStub.firstCall.args[0], true);
    expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
  });

  [DISALLOWED_URI, "https://localhost.attacker.com/steal", "https://localhost@attacker.com/steal", "https://[invalid"]
    .forEach((redirectUri) => {
      it(`should reject a disallowed or invalid redirect URI: ${redirectUri}`, () => {
        let error;
        try {
          accessTokenRequest(REQUEST, redirectUri);
        } catch (caught) {
          error = caught;
        }

        expect(error).to.include({
          code: "INVALID_REDIRECT_URI",
          status: 400,
          error: "Bad Request",
          message: "Redirect URI is not permitted",
        });
        expect(fetchStub).not.to.have.been.called;
      });
    });
});
