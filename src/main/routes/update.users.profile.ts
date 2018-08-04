import { fetchAll } from "../service/jurisdiction.service";
const router = require("../routes/home");

/* GET create user form. */
router.get("/updateusersprofile", (req, res, next) => {

    fetchAll(req).then((response) => {
        res.status(201);
        const responseContent: { [k: string]: any } = {};
        responseContent.jurisdictions = JSON.stringify(response);
        responseContent.idamId = req.query.idamId;
        responseContent.jurisdiction = req.query.jurisdiction;
        responseContent.casetype = req.query.casetype;
        responseContent.state = req.query.state;
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
