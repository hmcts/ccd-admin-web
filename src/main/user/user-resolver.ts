import { fetch } from "../util/fetch";
import config from "config";

export const getTokenDetails = (jwt: string) => {
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;
  const idamWebPublicUrl: string = config.get<string>("idam.web_public_url");

  return fetch(`${idamWebPublicUrl}/o/userinfo`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
