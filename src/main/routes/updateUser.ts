import * as config from "config";
import { fetch } from "../service/get-service";
import router from "./home";
import { sanitize } from "../util/sanitize";
import { validate } from "../validators/validateUserProfile";

const url = config.get("adminWeb.jurisdiction_url");

// Apply Validation
function validateUpdate(req, res, next) {
    validate(req, res, next, "/userprofiles");
}

/* POST form data to Create User form. */
router.post("/updateuser", validateUpdate, (req, res, next) => {

    fetch(req, url).then((response) => {
        res.status(200);
        const responseContent: { [k: string]: any } = {};
        responseContent.adminWebAuthorization = req.adminWebAuthorization;
        responseContent.jurisdictions = JSON.stringify(response);
        responseContent.idamId = sanitize(req.body.idamId);
        responseContent.jurisdiction = sanitize(req.body.jurisdiction);
        responseContent.currentjurisdiction = sanitize(req.body.currentjurisdiction);
        responseContent.casetype = sanitize(req.body.casetype);
        responseContent.state = sanitize(req.body.state);
        responseContent.update = "true";
        responseContent.heading = "Update User Profile";
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
