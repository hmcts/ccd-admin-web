import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { getDictionary } from "../service/welsh-dictionary-service";
import { sanitize } from "../util/sanitize";
import { Logger } from "@hmcts/nodejs-logging";
import * as moment from 'moment';
import downloadCsv from 'download-csv';
import { creatCsvFile, downloadFile, detectionClientType} from 'download-csv';

const errorPage = "error";
const welshDictionary = "welshDictionary";
const router = express.Router();
const dictionaryUrl = "/dictionary";


// load global search index page
router.get(`/${welshDictionary}`, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.dictionaryUrl = dictionaryUrl;
    res.render(welshDictionary, responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

// retrieve latest welsh dictionary and convert to csv
router.get(dictionaryUrl, (req, res, next) => {
  const logger = Logger.getLogger(__filename);
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    getDictionary(req).then((response) => {
      let formattedDate = (moment(new Date())).format('yyyyMMDDHHmmSS');
      var data = JSON.parse(response.text).translations;
      const client = detectionClientType();
      console.log(client);
      downloadFile(creatCsvFile(data, null), 'temp.csv');
      logger.info("COMPLETED SUCCESS");
      downloadCsv(data, null, `${formattedDate}` + ".csv");
      res.status(200).send(response.body);
    })
    .catch((error) => {
      res.status(400).send(error.response.text);
    });
  } else {
    res.status(403).send(error_unauthorized_role(req));
  }
});

export default router;
