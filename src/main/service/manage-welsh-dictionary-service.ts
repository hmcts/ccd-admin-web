import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";
const { Readable } = require("stream");

const logger = Logger.getLogger(__filename);
const csv = require("fast-csv");

function buildTranslationsJson(data) {
  let translations = "";
  for (const element of data) {
      if (translations.length > 0) {
          translations += ",";
      }
      translations += "\"" + element.englishPhrase + "\":\"" + element.welshPhrase + "\"";
  }
  return translations;
}

export function getRowDataArrayFromCsv(req) {
    const file = req.file;
    logger.debug("create stream...");
    const stream = Readable.from(file.buffer);
    return new Promise((resolve, reject) => {
        const data = [];
        csv
            .parseStream(stream, {headers : true})
            .on("error", reject)
            .on("data", (row) => {
                data.push(row);
            })
            .on("end", () => {
                resolve(data);
            });
    });
}

export async function uploadTranslations(req) {
  const url = config.get("adminWeb.welsh_translation_get_dictionary_url");
  const headers = {
      "Accept": "application/json",
      "Authorization": req.accessToken,
      "Content-Type": "application/json",
      "ServiceAuthorization": req.serviceAuthToken,
  };

  const data = await getRowDataArrayFromCsv(req);
  logger.debug("data:", data);

  const translations = buildTranslationsJson(data);

  const dictionary = "{\"translations\":{" + translations + "}}";
  logger.debug("dictionary: {}", dictionary);

  logger.info("Putting dictionary...");

  return request
        .put(url)
        .set(headers)
        .set("enctype", "multipart/form-data")
        .send(dictionary)
        .then((res) => {
         logger.debug("Dictionary uploaded from file " + req.file.originalname + " to Translation Service, response: "
             + res.text);
         if (res.text.length === 0) {
            res.text = "Dictionary successfully updated";
          }
         return res;
        })
        .catch((error) => {
          if (error.response) {
            logger.error("Error uploading Dictionary data to Translation Service: ", error.response.text);
            throw error;
          } else {
            const errMsg = "Error uploading Dictionary data to Translation Service: no error response";
            logger.error(errMsg);
            error.text = errMsg;
            throw error;
          }
        });
}
