import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";
const { Readable } = require("stream");
const csv = require("fast-csv");

export function buildTranslationsJson(data) {
  let translations = "";
  for (const element of data) {
      if (translations.length > 0) {
          translations += ",";
      }
      translations += "\"" + element.englishPhrase + "\":\"" + element.welshPhrase + "\"";
  }
  return translations;
}

export function getRowDataArrayFromCsv(stream) {
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

  const logger = Logger.getLogger(__filename);
  const file = req.file;
  const stream = Readable.from(file.buffer);
  const data = await getRowDataArrayFromCsv(stream);
  const translations = buildTranslationsJson(data);
  const dictionary = "{\"translations\":{" + translations + "}}";

  return request
        .put(url)
        .set(headers)
        .set("enctype", "multipart/form-data")
        .send(dictionary)
        .then((res) => {
            logger.info(`Received successful response: ${res.text}`);
            return res;
        })
        .catch((error) => {
          if (error.response) {
            throw error;
          } else {
            error.text = "Error uploading Dictionary data to Translation Service: no error response";
            throw error;
          }
        });
}