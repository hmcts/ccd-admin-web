import _fetch, { RequestInfo, RequestInit, Response } from "node-fetch";

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

export const fetch = (url: RequestInfo, init?: RequestInit) => {
  return _fetch(url, init)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res;
      }

      throw new FetchError(res);
    });
};
