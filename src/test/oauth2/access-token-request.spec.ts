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
  const TOKEN_ENDPOINT = "http://localhost:1234/oauth2/token";
  const REDIRECT_URN = "localhost/redirect/to";
  const REDIRECT_URL = "https://localhost/redirect/to";
  const AUTH_CODE = "xyz789";

  const REQUEST = mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URN,
    },
  });
  const REQUEST_WITH_HTTPS = mockReq({
    query: {
      code: AUTH_CODE,
      redirect_uri: REDIRECT_URL,
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
  let fetchStub: sinon.SinonStub;
  let fetchMethod;
  let accessTokenRequest;

  beforeEach(() => {
    config = {
      get: sinon.stub(),
    };

    config.get.withArgs("idam.oauth2.client_id").returns(CLIENT_ID);
    config.get.withArgs("secrets.ccd.ccd-admin-web-oauth2-client-secret").returns(CLIENT_SECRET);
    config.get.withArgs("idam.oauth2.token_endpoint").returns(TOKEN_ENDPOINT);

    fetchStub = sinon.stub();
    fetchMethod = {
      fetch: fetchStub.callsFake(function() {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve(RESPONSE.body)
        });
      })
    };

    accessTokenRequest = proxyquire("../../main/oauth2/access-token-request", {
      "config": config,
      "../util/fetch": fetchMethod,
    }).accessTokenRequest;
  });

  it("should call the IdAM OAuth 2 token endpoint with the correct headers and query string parameters", (done) => {

    accessTokenRequest(REQUEST_WITH_HTTPS)
      .then(() => {
        expect(fetchStub.called).to.be.true;
        expect(fetchStub.lastCall.args[1].headers.Authorization).to.equal(
          "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"));
        const requestedUrl = url.parse(fetchStub.lastCall.args[0], true);
        expect(requestedUrl.query.code).to.equal(AUTH_CODE);
        expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
        done();
      })
      .catch((error) => done(error));
  });

  it("should add `https://` prefix", (done) => {

    accessTokenRequest(REQUEST)
      .then(() => {
        expect(fetchStub.called).to.be.true;
        expect(fetchStub.lastCall.args[1].headers.Authorization).to.equal(
          "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"));
        const requestedUrl = url.parse(fetchStub.lastCall.args[0], true);
        expect(requestedUrl.query.code).to.equal(AUTH_CODE);
        expect(requestedUrl.query.redirect_uri).to.equal(REDIRECT_URL);
        done();
      })
      .catch((error) => done(error));
  });
});
