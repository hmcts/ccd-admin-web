import { fetch } from "../util/fetch";
import config from "config";

export const getTokenDetails = (jwt: string) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;
  const idamBaseUrl: string = config.get<string>("idam.base_url");

  return fetch(`${idamBaseUrl}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
