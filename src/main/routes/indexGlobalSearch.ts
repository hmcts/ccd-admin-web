import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { createGlobalSearchIndex } from "../service/global-search-index-service";
import {sanitize} from "../util/sanitize";

const errorPage = "error";
const router = express.Router();
const globalSearch = "globalsearch";
const globalSearchIndexingUrl = "/elastic-support/global-search/index";

// load global search index page
router.get(`/${globalSearch}`, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.globalSearchIndexingUrl = globalSearchIndexingUrl;
    res.render(globalSearch, responseContent);
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

// perform (re)creation of global search indices
router.post(globalSearchIndexingUrl, (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    createGlobalSearchIndex(req).then((response) => {
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
