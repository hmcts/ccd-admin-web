import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { getCaseTypes, createElasticIndex } from "../service/elastic-index-service";
import { sanitize } from "../util/sanitize";

const errorPage = "error";
const router = express.Router();
const elasticsearch = "elasticsearch";
const caseTypesUrl = "/elasticsearch/case-types";
const indexingUrl = "/elasticsearch/index";

router.get(`/${elasticsearch}`, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.indexingUrl = indexingUrl;
    responseContent.caseTypesUrl = caseTypesUrl;
    res.render(elasticsearch, responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

router.get(caseTypesUrl, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    getCaseTypes(req).then((response) => {
      res.status(200).send(response.body);
    })
    .catch((error) => {
      res.status(400).send(error.response.text);
    });
  } else {
    res.status(403).send(error_unauthorized_role(req));
  }
});

router.post(indexingUrl, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    createElasticIndex(req).then((response) => {
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
