import { fetch } from "../service/get-service";
import * as config from "config";
const router = require("../routes/home");
import { validate } from "../validators/validateUserProfile";
import { sanitize } from "../util/sanitize";
const url = config.get("adminWeb.jurisdiction_url");

// Apply Validation
function validateUpdate(req, res, next) {
    validate(req, res, next, "/userprofiles");
}

/* GET create user form. */
router.post("/updateusersprofile", validateUpdate, (req, res, next) => {

    fetch(req, url).then((response) => {
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
