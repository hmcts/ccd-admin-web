import {get} from "config";
import _fetch, {RequestInit, Response} from "node-fetch";

export class FetchError extends Error {
  public readonly response: Response;
  public readonly status: number;

  constructor(response: Response) {
    super(`HTTP ${response.status} ${response.statusText}`);
    this.name = "FetchError";
    this.response = response;
    this.status = response.status;
  }
}

const allowedOrigins = [
  new URL(get<string>("idam.base_url")).origin,
  new URL(get<string>("idam.s2s_url")).origin,
];

const getAllowedUrl = (url: string): string => {
  const parsedUrl = new URL(url);

  if (!allowedOrigins.includes(parsedUrl.origin)) {
    throw new Error(`URL origin is not allowed: ${parsedUrl.origin}`);
  }

  return parsedUrl.toString();
};

export const fetch = async (url: string, init?: RequestInit) => {
  const allowedUrl = getAllowedUrl(url);
  const res = await _fetch(allowedUrl, init); // NOSONAR - URL origin is validated against configured services.

  if (res.status >= 200 && res.status < 300) {
    return res;
  }

  throw new FetchError(res);
};
