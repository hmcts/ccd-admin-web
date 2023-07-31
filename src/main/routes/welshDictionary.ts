import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { getDictionary } from "../service/welsh-dictionary-service";
import { sanitize } from "../util/sanitize";

const errorPage = "error";
const welshDictionary = "welshDictionary";
const router = express.Router();
const dictionaryUrl = "/dictionary";

router.get(`/${welshDictionary}`, (req, res, next) => {
   if (req.adminWebAuthorization && req.adminWebAuthorization.canManageWelshTranslation) {
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
   if (req.adminWebAuthorization && req.adminWebAuthorization.canManageWelshTranslation) {
    getDictionary(req).then((response) => {
      const data = JSON.parse(response.text).translations;
      const csvContent = flattenJsonResponse(data);
      const download = Buffer.from(csvContent, "utf8");
      res.end(download);
    })
    .catch((error) => {
      res.status(400).send(error.response.text);
    });
  } else {
    res.status(403).send(error_unauthorized_role(req));
  }
});

export function flattenJsonResponse(res: object) {
  const flat = [];
  Object.keys(res).forEach((k) => {
    let str = k;
    const v = res[k];
    str = str + "," + (v.translation ? v.translation : "");
    str = str + "," + (v.yesOrNo ? v.yesOrNo : "");
    str = str + "," + (v.yes ? v.yes : "");
    str = str + "," + (v.no ? v.no : "");
    flat.push(str.replace(/[,]+$/g, ""));
  });
  return flat.join("\r\n");
}

export default router;
