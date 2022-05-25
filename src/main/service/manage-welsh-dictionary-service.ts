import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";
//import { csvToJson } from "convert-csv-to-json";

export function uploadFile(req) {
  const url = config.get("adminWeb.welsh_translation_get_dictionary_url");
  const headers = {
    Authorization: req.accessToken,
    ServiceAuthorization: req.serviceAuthToken,
  };
  const logger = Logger.getLogger(__filename);

 const dictionary = {};
// const translations = {};
//  dictionary.push(translations);
//  const json = csvToJson.fieldDelimiter(',').getJsonFromCsv(req.file.buffer);
//  dictionary.translations.push(json);
 console.log(dictionary);

 var obj = '{'
        +'"name" : "Raj",'
        +'"age"  : 32,'
        +'"married" : false'
        +'}';
        console.log(obj);
    return request
        .post(url)
        .set(headers)
        .set("enctype", "multipart/form-data")
        .attach("file", req.file.buffer, { filename: req.file.originalname })
        .then((res) => {
          logger.info(`Uploaded file ${req.file.originalname} to Translation Service, response: ${res.text}`);
          return res;
        })
        .catch((error) => {
          if (error.response) {
            logger.error(`Error uploading file to Translation Service: ${error.response.text}`);
            throw error;
          } else {
            const errMsg = "Error uploading file to Translation Service: no error response";
            logger.error(errMsg);
            error.text = errMsg;
            throw error;
          }
        });
}
