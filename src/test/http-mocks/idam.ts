import * as config from "config";
import * as mock from "nock";
import * as HttpStatus from "http-status-codes";

const idamApiBaseUrl = config.get("idam.base_url");
const s2sAuthServiceBaseUrl = config.get("idam.s2s_url");

export const defaultAuthToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJpZGFtIiwiaWF0IjoxNDgzMjI4ODAwLCJleHAiOjQxMDI0NDQ4MDAsImF1ZCI6ImNtY" +
  "yIsInN1YiI6ImNtYyJ9.Q9-gf315saUt007Gau0tBUxevcRwhEckLHzC82EVGIM"; // valid until 1st Jan 2100

export function resolveRetrieveUserFor(id: string, ...roles: string[]) {
  return mock(idamApiBaseUrl)
    .get("/details")
    .reply(HttpStatus.OK, { id, roles, email: "user@example.com" });
}

export function resolveExchangeCode(token: string) {
  mock(idamApiBaseUrl)
    .post(new RegExp("/oauth2/token.*"))
    .reply(HttpStatus.OK, {
      access_token: token,
      expires_in: 28800,
      token_type: "Bearer",
    });
}

export function resolveInvalidateSession(token: string) {
  mock(idamApiBaseUrl)
    .delete(`/session/${token}`)
    .reply(HttpStatus.OK);
}

export function rejectInvalidateSession(token: string = defaultAuthToken, reason: string = "HTTP error") {
  mock(idamApiBaseUrl)
    .delete(`/session/${token}`)
    .reply(HttpStatus.INTERNAL_SERVER_ERROR, reason);
}

export function rejectRetrieveUserFor(reason: string) {
  return mock(idamApiBaseUrl)
    .get("/details")
    .reply(HttpStatus.FORBIDDEN, reason);
}

export function resolveRetrieveServiceToken(token: string = defaultAuthToken) {
  return mock(s2sAuthServiceBaseUrl)
    .post("/lease")
    .reply(HttpStatus.OK, token);
}

export function rejectRetrieveServiceToken(reason: string = "HTTP error") {
  return mock(s2sAuthServiceBaseUrl)
    .post("/lease")
    .reply(HttpStatus.INTERNAL_SERVER_ERROR, reason);
}
