import { fetch } from "../util/fetch";
import config = require("config");

export const getTokenDetails = (jwt) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  return fetch(`${config.get("idam.base_url")}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
