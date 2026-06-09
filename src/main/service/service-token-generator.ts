import { jwtDecode } from "jwt-decode";
import OTP from "otp";
import { fetch } from "../util/fetch";
import config from "config";

const idamS2SUrl = config.get<string>("idam.s2s_url");
const serviceName = config.get<string>("idam.service_name");
const secret = config.get<string>("secrets.ccd.microservicekey-ccd-admin");
const otp = new OTP({ secret });

// TODO Caching should be handled by a singleton service
const cache = {};

export const serviceTokenGenerator = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (cache[serviceName]
        && currentTime < cache[serviceName].expiresAt) {
      return Promise.resolve(cache[serviceName].token);
    } else {
      const oneTimePassword = otp.totp(Date.now());
      const form = {
        microservice: serviceName,
        oneTimePassword,
      };
      const headers = {
        "Content-Type": "application/json",
      };

      return fetch(`${idamS2SUrl}/lease`, { body: JSON.stringify(form), headers, method: "POST" })
          .then((res) => res.text())
          .then((token) => {
            const tokenData = jwtDecode(token);

            cache[serviceName] = {
              expiresAt: tokenData.exp,
              token,
            };

            return token;
          });
    }
};
