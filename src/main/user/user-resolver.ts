import { fetch } from "../util/fetch";
import { get } from "config";
import { Logger } from "@hmcts/nodejs-logging";

export const getTokenDetails = (jwt) => {

  const logger = Logger.getLogger(__filename);
  const BEARER_JWT = jwt.startsWith("Bearer ") ? jwt : "Bearer " + jwt;

  logger.info("inside getTokenDetails ");
  logger.info("inside getTokenDetails BEARER_JWT " + BEARER_JWT);

  return fetch(`${get("idam.base_url")}/details`, {
    headers: {
      Authorization: BEARER_JWT,
    },
  })
  .then((res) => res.json());
};
