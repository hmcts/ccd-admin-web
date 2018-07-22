import { fetchAll } from "../service/jurisdiction.service";
const router = require("../routes/home");

/* GET Jurisdiction page. */
router.get("/jurisdiction", (req, res, next) => {

  fetchAll(req).then((response) => {
    res.status(201);
    const responseContent: { [k: string]: any } = {};
    responseContent.jurisdictions = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = req.session.error;
      delete req.session.error;
    }
    res.render("jurisdiction", responseContent);
  })
    .catch((error) => {
      // Call the next middleware, which is the error handler
      next(error);
    });
});

/* tslint:disable:no-default-export */
export default router;
