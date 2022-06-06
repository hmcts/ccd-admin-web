import * as config from "config";
import { Logger } from "@hmcts/nodejs-logging";
import * as request from "superagent";
const logger = Logger.getLogger(__filename);

const fs = require("fs");
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

function getRowDataArrayFromCsv(stream) {
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

export async function uploadFile(req) {
  const url = config.get("adminWeb.welsh_translation_get_dictionary_url");
  const filePath = config.get("adminWeb.welsh_translation_upload_dictionary_file_path");
  const headers = {
      "Accept": "application/json",
      "Authorization": req.accessToken,
      "Content-Type": "application/json",
      "ServiceAuthorization": req.serviceAuthToken,
  };

  const fileRef = filePath + "/" + req.file.originalname;
  const stream = fs.createReadStream(fileRef);
  logger.info("fileRef: " + fileRef);

  const data = await getRowDataArrayFromCsv(stream);
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
          logger.debug("Dictionary uploaded from file " + fileRef + " to Translation Service, response: " + res.text);
          if (res.text == null) {
            res.text = "Dictionary successfully updated";
          }
          return res;
        })
        .catch((error) => {
          if (error.response) {
            logger.error(`Error uploading Dictionary data to Translation Service: ${error.response.text}`);
            throw error;
          } else {
            const errMsg = "Error uploading Dictionary data to Translation Service: no error response";
            logger.error(errMsg);
            error.text = errMsg;
            throw error;
          }
        });
}
