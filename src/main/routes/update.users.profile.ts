import { fetchAll } from "../service/jurisdiction.service";
const router = require("../routes/home");

/* GET create user form. */
router.post("/updateusersprofile", (req, res, next) => {

    fetchAll(req).then((response) => {
        res.status(201);
        const responseContent: { [k: string]: any } = {};
        responseContent.jurisdictions = JSON.stringify(response);
        responseContent.idamId = req.body.idamId;
        responseContent.jurisdiction = req.body.jurisdiction;
        responseContent.casetype = req.body.casetype;
        responseContent.state = req.body.state;
        responseContent.update = "true";
        responseContent.heading = "Update User profile";
        responseContent.submitButtonText = "Update";
        if (req.session.error) {
            responseContent.error = req.session.error;
            delete req.session.error;
        }
        res.render("user-profiles/create-user-form", responseContent);
    })
        .catch((error) => {
            // Call the next middleware, which is the error handler
            next(error);
        });
});

export default router;
