import { fetch } from "../util/fetch";
import { get } from "config";

export const getTokenDetails = (jwt) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  console.log('inside getTokenDetails ');

  console.log('${get("idam.base_url")}/details ' + '${get("idam.base_url")}/details');
  console.log('inside getTokenDetails BEARER_JWT ' + BEARER_JWT);

  return fetch(`${get("idam.base_url")}/details`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
