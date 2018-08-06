import * as express from "express";
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

/* tslint:disable:no-default-export */
export default router.post("/import", (req, res, next) => {
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
