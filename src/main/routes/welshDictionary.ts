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
      const download = "\ufeff\ufeff" + // utf-8 BOM for excel (must be twice as browsers strip out first one)
        Buffer.from(csvContent, "utf8").toString("utf8");
      res.set({ "content-type": "text/csv; charset=utf-8" });
      res.send(download);
    }).catch((error) => {
      res.status(400).send(error.response);
    });
  } else {
    res.status(403).send(error_unauthorized_role(req));
  }
});

export function flattenJsonResponse(res: object) {
  const flat = [];
  Object.keys(res).forEach((k) => {
    let str = wrapSpecialCharacters(k);
    const v = res[k];
    str = str + "," + (v.translation ? wrapSpecialCharacters(v.translation) : "");
    str = str + "," + (v.yesOrNo ? v.yesOrNo : "");
    str = str + "," + (v.yes ? wrapSpecialCharacters(v.yes) : "");
    str = str + "," + (v.no ? wrapSpecialCharacters(v.no) : "");
    flat.push(str.replace(/[,]{1,4}$/g, "")); // remove trailing commas
  });
  return flat.join("\r\n");
}

function wrapSpecialCharacters(text: string): string {
  // Return if no special characters
  if (typeof text !== "string" || !text.match(/[,\n\"]/g)) {
    return text;
  }

  return "\"" + text.replace(/[\"]/g, "\"\"") + "\"";
}

export default router;
