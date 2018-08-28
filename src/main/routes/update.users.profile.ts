import { fetchAll } from "../service/jurisdiction.service";
const router = require("../routes/home");
const validator = require("validator");
import { Validator } from "../validators/validate";
import { sanitize } from "../util/sanitize";

// Validate
function validateUpdate(req, res, next) {
    const jurisdictionName = new Validator(req.body.currentjurisdiction);
    delete req.session.success;
    if (jurisdictionName.isEmpty()) {
        req.session.error = { status: 401, text: "Please select jurisdiction name" };
        res.redirect(302, "/jurisdiction");
    } else if (!validator.isEmail(req.body.idamId)) {
        req.session.error = { status: 401, text: "Please select a valid email address!" };
        res.redirect(302, "/userprofiles");
    } else {
        delete req.session.error;
        next();
    }
}
/* GET create user form. */
router.post("/updateusersprofile", validateUpdate, (req, res, next) => {

    fetchAll(req).then((response) => {
        res.status(201);
        const responseContent: { [k: string]: any } = {};
        responseContent.jurisdictions = JSON.stringify(response);
        responseContent.idamId = sanitize(req.body.idamId);
        responseContent.jurisdiction = sanitize(req.body.jurisdiction);
        responseContent.currentjurisdiction = sanitize(req.body.currentjurisdiction);
        responseContent.casetype = sanitize(req.body.casetype);
        responseContent.state = sanitize(req.body.state);
        responseContent.update = "true";
        responseContent.heading = "Update User profile";
        responseContent.submitButtonText = "Update";
        if (req.session.error) {
            responseContent.error = req.session.error;
            delete req.session.error;
        }
        res.render("user-profiles/create-user-form", responseContent);
    }).catch((error) => {
        // Call the next middleware, which is the error handler
        next(error);
    });
});

export default router;
