import { app } from "../../main/app";
import * as cookie from "cookie";
import { COOKIE_ACCESS_TOKEN } from "../../main/routes/oauth2redirect";
import { expect } from "chai";
import * as idamServiceMock from "../http-mocks/idam";
import * as request from "supertest";

describe("oauth2redirect", () => {

  const token = "ey123.ey456";

  describe("when OAuth2 code is present", () => {
    it("should set an accessToken cookie and redirect to /", () => {
      idamServiceMock.resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect?code=abc123")
        .then((res) => {
          const cookies = res.get("Set-Cookie").map((_) => cookie.parse(_));
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.true;
          expect(res.headers.location).to.equal("/");
        });
    });
  });

  describe("when OAuth2 code is not present", () => {
    it("should not set an accessToken cookie", () => {
      idamServiceMock.resolveExchangeCode(token);

      return request(app)
        .get("/oauth2redirect")
        .then((res) => {
          const cookies = res.get("Set-Cookie").map((_) => cookie.parse(_));
          expect(cookies.some((c) => c[`${COOKIE_ACCESS_TOKEN}`] === token)).to.be.false;
          expect(res.status).to.equal(500);
          expect(res.text).includes("Error: Unable to obtain access token - no OAuth2 code provided");
        });
    });
  });
});
