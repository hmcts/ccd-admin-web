import * as config from "config";
import * as express from "express";
import { fetch } from "../service/get-service";
import * as multer from "multer";
import { uploadFile } from "../service/import-service";

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
  upload(req, res, (err) => {
    if (err) {
      next(err);
    } else {
      uploadFile(req)
        .then((response) => {
          res.status(201);
          res.render("home", { response });
        })
        .catch((error) => {
          // Call the next middleware, which is the error handler
          next(error);
        });
    }
  });
});

/* GET Import Definition page. */
router.get("/import", (req, res, next) => {
  fetch(req, url).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};

    responseContent.importAudits = JSON.parse(response);
    if (req.query.page) {
      delete req.session.error;
    }
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("importDefinition", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

export default router;
