import * as request from "superagent";
import { Logger } from "@hmcts/nodejs-logging";

export function fetch(req, url: any, query?: object) {
    const logger = Logger.getLogger(__filename);
    const headers = {
        Authorization: req.accessToken,
        ServiceAuthorization: req.serviceAuthToken,
    };

    logger.info(`Fetch query parameter: ${ JSON.stringify(query) }`);
  console.log('get-service.ts !!!!!!' );
  console.log('headers.Authorization !!!!!! '+ headers.Authorization);
  console.log('headers.ServiceAuthorization !!!!!! '+ headers.ServiceAuthorization);
  console.log('query ------ !!!!!! '+ query);
  console.log('method!!' +req.method);
  console.log('headers!!' + req.headers);

  for (var property in req.headers) {
    if (req.headers.hasOwnProperty(property)) {
      console.log(property + ': VALUE ' + req.headers[property])
    }
  }

  console.log('req url!!!' + req.url);
  console.log('url!!! fin' + url);

    return request
        .get(url)
        .query(query)
        .set(headers)
        .then((res) => {
            logger.debug(`Get data, response: ${res.text}`);
            return res.text;
        })
        .catch((error) => {
            if (error.response) {
                logger.error(`Error retrieving data: ${error.response}`);
                logger.error(`Error retrieving data: ${error.response.text}`);
                throw error;
            } else {
                const errMsg = "Error retrieving data: no error response";
                logger.error(errMsg);
                error.text = errMsg;
                throw error;
            }
        });
}
