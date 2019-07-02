import * as config from "config";
import * as express from "express";
import { error_unauthorized_role } from "../util/error_unauthorized_role";
import { fetch } from "../service/get-service";
import * as multer from "multer";
import { uploadFile } from "../service/import-service";
import { sanitize } from "../util/sanitize";

const errorPage = "error";
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xls|xlsx)$/)) {
      return cb(new Error("Only Excel files are allowed"));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 10485760,
  },
  storage,
}).single("file");
const url = config.get("adminWeb.import_audits_url");

router.post("/import", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    upload(req, res, (err) => {
      if (err) {
        // Construct error message manually since err cannot be passed via req.session.error (it is cleared on redirect)
        req.session.error = err.name + ": " + err.message;

        // Redirect back to /import, to let the Import Definition page handle displaying the error message
        res.redirect(302, "/import");
      } else if (req.file === undefined) {
        req.session.error = "No file selected! Please select a Definition spreadsheet to import";
        res.redirect(302, "/import");
      } else {
        uploadFile(req)
          .then((response) => {
            res.status(201);
            const responseContent: { [k: string]: any } = {};
            responseContent.adminWebAuthorization = req.adminWebAuthorization;
            responseContent.user = sanitize(JSON.stringify(req.authentication.user));
            // Re-fetch the Import Audits data
            fetch(req, url).then((data) => {
              responseContent.importAudits = JSON.parse(sanitize(data));
              responseContent.response = response;
              res.render("importDefinition", responseContent);
            })
              .catch((error) => {
                // Call the next middleware, which is the error handler
                next(error);
              });
          })
          .catch((error) => {
            req.session.error = {
              message: error.message ? error.message : "Bad Request",
              status: error.status ? error.status : 400,
              text: error.response ? error.response.text : "An error occurred on import",
            };
            res.redirect(302, "/import");
          });
      }
    });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

/* GET Import Definition page. */
router.get("/import", (req, res, next) => {
  if (req.adminWebAuthorization && req.adminWebAuthorization.canImportDefinition) {
    fetch(req, url).then((response) => {
      res.status(200);
      const responseContent: { [k: string]: any } = {};
      responseContent.adminWebAuthorization = req.adminWebAuthorization;
      responseContent.user = sanitize(JSON.stringify(req.authentication.user));
      responseContent.importAudits = JSON.parse(sanitize(response));
      if (req.query.page) {
        delete req.session.error;
      }
      if (req.session.error) {
        responseContent.error = sanitize(req.session.error);
        delete req.session.error;
      }
      res.render("importDefinition", responseContent);
    })
      .catch((error) => {
        // Call the next middleware, which is the error handler
        next(error);
      });
  } else {
    res.render(errorPage, error_unauthorized_role(req));
  }
});

export default router;
