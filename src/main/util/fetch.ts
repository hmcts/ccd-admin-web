import _fetch from "node-fetch";
import { Response } from "node-fetch";

export const fetch = (url: string, options?: any): Promise<Response> => {
  return _fetch(url, options)
    .then((res: Response) => {

      if (res.status >= 200 && res.status < 300) {
          return res;
      }

      return Promise.reject(res.text());
    });
};
