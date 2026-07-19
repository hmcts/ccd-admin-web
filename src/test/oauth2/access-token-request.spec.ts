import * as chai from "chai";
import * as fetchMock from "fetch-mock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as sinonExpressMock from "sinon-express-mock";
import * as url from "url";

const expect = chai.expect;
chai.use(sinonChai);

describe("Access Token Request", () => {
  const CLIENT_ID = "ccd_admin";
  const CLIENT_SECRET = "abc123def456";
  const TOKEN_ENDPOINT = "http://localhost:1234/oauth2/token";
  const REDIRECT_URN = "localhost/redirect/to";
  const REDIRECT_URL = "https://localhost/redirect/to";
  const REDIRECT_URL_WITH_PORT = "https://localhost:3501/redirect/to";
  const DISALLOWED_URI = "https://attacker.com/steal";
  const AUTH_CODE = "xyz789";
  const REDIRECT_ALLOWLIST = "localhost,127.0.0.1";

  const REQUEST = sinonExpressMock.mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URN,
    },
  });
  const REQUEST_WITH_HTTPS = sinonExpressMock.mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URL,
    },
  });
  const REQUEST_WITH_PORT = sinonExpressMock.mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URL_WITH_PORT,
    },
  });
  const RESPONSE = {
    body: {
      access_token: "q1w2e3r4t5y6",
      expires_in: 3600,
      token_type: "Bearer",
    },
    status: 200,
  };

  let config;
  let fetch;
  let accessTokenRequest;

  beforeEach(() => {
    config = {
      get: sinon.stub(),
    };
    config.get.withArgs("idam.oauth2.redirect_uri_allowlist").returns(REDIRECT_ALLOWLIST);
    fetch = fetchMock.sandbox().post(`begin:${TOKEN_ENDPOINT}`, RESPONSE);

    accessTokenRequest = proxyquire("../../main/oauth2/access-token-request", {
      config,
      "node-fetch": fetch,
    }).accessTokenRequest;
  });

  it("should call the IdAM OAuth 2 token endpoint with the correct headers and query string parameters", (done) => {
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.token_endpoint").returns(TOKEN_ENDPOINT);

    accessTokenRequest(REQUEST_WITH_HTTPS)
      .then(() => {
        expect(fetch.called()).to.be.true;
        expect(fetch.lastOptions().headers.Authorization).to.equal(
          "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"));
        const requestedUrl = url.parse(fetch.lastUrl(), true);
        expect(requestedUrl.query.code).to.equal(AUTH_CODE);
        expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
        done();
      })
      .catch((error) => done(new Error(error)));
  });

  it("should add `https://` prefix", (done) => {
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.token_endpoint").returns(TOKEN_ENDPOINT);

    accessTokenRequest(REQUEST)
      .then(() => {
        expect(fetch.called()).to.be.true;
        expect(fetch.lastOptions().headers.Authorization).to.equal(
          "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"));
        const requestedUrl = url.parse(fetch.lastUrl(), true);
        expect(requestedUrl.query.code).to.equal(AUTH_CODE);
        expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
        done();
      })
      .catch((error) => done(new Error(error)));
  });

  it("should allow redirect URIs with an allowed hostname and port", (done) => {
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.token_endpoint").returns(TOKEN_ENDPOINT);

    accessTokenRequest(REQUEST_WITH_PORT)
      .then(() => {
        expect(fetch.called()).to.be.true;
        const requestedUrl = url.parse(fetch.lastUrl(), true);
        expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL_WITH_PORT);
        done();
      })
      .catch((error) => done(new Error(error)));
  });

  it("should reject redirect URIs with disallowed hosts", async () => {
    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.token_endpoint").returns(TOKEN_ENDPOINT);
    const REQUEST_DISALLOWED = sinonExpressMock.mockReq({
      query: { code: AUTH_CODE, redirect_uri: DISALLOWED_URI },
    });
    try {
      await accessTokenRequest(REQUEST_DISALLOWED);
      expect.fail("Expected error to be thrown");
    } catch (error) {
      expect(error.status).to.equal(400);
      expect(error.error).to.equal("Bad Request");
      expect(error.message).to.equal("Redirect URI is not permitted");
    }
  });
});
