import { fetch } from "../util/fetch";
import { get } from "config";

export const getTokenDetails = (jwt) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  return fetch(`${get("idam.hmcts_access_url")}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
