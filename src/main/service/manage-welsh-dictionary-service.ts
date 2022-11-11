import * as config from "config";
import * as request from "superagent";
const { Readable } = require("stream");
const csv = require("fast-csv");

export function buildTranslationsJson(data) {
  let translations = "";
  for (const element of data) {
      if (translations.length > 0) { translations += ","; }
      if (element[1] === undefined || element[1] === null) {
        translations += JSON.stringify(element[0]) + ":" + JSON.stringify(null);
      } else {
        translations += JSON.stringify(element[0]) + ":" + JSON.stringify(element[1]);
      }
  }
  return translations;
}

export function getRowDataArrayFromCsv(stream) {
    return new Promise((resolve, reject) => {
        const data = [];
        csv
            .parseStream(stream, {headers : false})
            .on("error", reject)
            .on("data", (row) => data.push(row))
            .on("end", () => resolve(data));
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
        .then((res) => res)
        .catch((error) => {
          if (error.response) {
              throw error;
          } else {
            error.text = "Error uploading Dictionary data to Translation Service: no error response";
            throw error;
          }
        });
}
