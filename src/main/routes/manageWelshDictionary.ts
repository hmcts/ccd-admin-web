import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { uploadTranslations } from "../service/manage-welsh-dictionary-service";
import { sanitize } from "../util/sanitize";
import * as multer from "multer";

const errorPage = "error";
const welshDictionary = "manageWelshDictionary";
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Only CSV files are allowed"));
    }
    return cb(null, true);
  },
  limits: { fileSize: 10485760 },
  storage,
}).single("file");

export function doUploadTranslationsThen(req) {
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  req.session.success = "Successfully uploaded the translations from " + req.file.originalname + ".";
  responseContent.success = req.session.success;
  return responseContent;
}

export function doUploadTranslationsCatch(req, error) {
  req.session.error = {
    message: error.message ? error.message : "Bad Request",
    status: error.status ? error.status : 400,
    text: error.response ? error.response.text : "An error occurred on import",
  };
  const responseContent: { [k: string]: any } = {};
  responseContent.adminWebAuthorization = req.adminWebAuthorization;
  responseContent.user = sanitize(JSON.stringify(req.authentication.user));
  responseContent.error = JSON.parse(sanitize(JSON.stringify(req.session.error)));
  delete req.session.error;
  return responseContent;
}

function doUploadTranslations(req, res) {
    uploadTranslations(req)
        .then(() => {
            res.render ? res.render("manageWelshDictionary", doUploadTranslationsThen(req)) : "";
        })
        .catch((error) => {
          res.render("manageWelshDictionary", doUploadTranslationsCatch(req, error));
        });
}

function doGetWelshDictionary(req, res) {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    if (req.query.page) {
        delete req.session.error;
    }
    if (req.session.error) {
        responseContent.error = JSON.parse(sanitize(JSON.stringify(req.session.error)));
        delete req.session.error;
    }
    res.render("manageWelshDictionary", responseContent);
}

router.post(`/${welshDictionary}`, (req, res) => {
    if (req.adminWebAuthorization &&
    (req.adminWebAuthorization.canLoadWelshTranslation || req.adminWebAuthorization.canManageWelshTranslation)) {
     upload(req, res, (err) => {
      if (err) {
        req.session.error = err.name + ": " + err.message;
        res.redirect(302, "/manageWelshDictionary");
      } else if (req.file === undefined) {
        req.session.error = "No file selected! Please select a translations csv file to import";
        res.redirect(302, "/manageWelshDictionary");
      } else {
          doUploadTranslations(req, res);
      }
    });
  } else {
        res.render(errorPage, error_unauthorized_role(req));
  }
});

router.get(`/${welshDictionary}`, (req, res) => {
    if (req.adminWebAuthorization &&
    (req.adminWebAuthorization.canLoadWelshTranslation || req.adminWebAuthorization.canManageWelshTranslation)) {
        doGetWelshDictionary(req, res);
    } else {
        res.render(errorPage, error_unauthorized_role(req));
    }
});

export default router;
