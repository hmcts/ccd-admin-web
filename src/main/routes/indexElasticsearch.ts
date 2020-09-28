import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { createElasticIndices } from "../service/elastic-index-service";
import { sanitize } from "../util/sanitize";

const errorPage = "error";
const router = express.Router();
const elasticsearch = "elasticsearch";

router.post(`/${elasticsearch}`, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    createElasticIndices(req)
      .then((response) => {
        res.status(201);
        const responseContent: { [k: string]: any } = {};
        responseContent.adminWebAuthorization = req.adminWebAuthorization;
        responseContent.user = sanitize(JSON.stringify(req.authentication.user));
        responseContent.groupedCaseTypes = JSON.parse(sanitize(response.text));
        res.render(elasticsearch, responseContent);
      })
      .catch((error) => {
        req.session.error = {
          message: error.message ? error.message : "Bad Request",
          status: error.status ? error.status : 400,
          text: error.response ? error.response.text : "An error occurred while creating Elasticsearch indices",
        };
        const responseContent: { [k: string]: any } = {};
        responseContent.adminWebAuthorization = req.adminWebAuthorization;
        responseContent.user = sanitize(JSON.stringify(req.authentication.user));
        responseContent.error = JSON.parse(sanitize(JSON.stringify(req.session.error)));
        delete req.session.error;
        res.render(elasticsearch, responseContent);
      });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

router.get(`/${elasticsearch}`, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    res.render(elasticsearch, responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
