import { deleteUserProfile } from "../service/delete.user.profile.service";
const router = require("../routes/home");

/* GET */
router.get("/deleteuserprofile", (req, res, next) => {
    const responseContent: { [k: string]: any } = {};
    responseContent.idamId = req.query.idamId;
    responseContent.response = req.session.response;
    responseContent.warning = `Are you sure you would like to delete user ${req.query.idamId}?`;

    if (req.session.error) {
        responseContent.error = req.session.error;
    }
    res.render("user-profiles/confirm-delete-user-profile", responseContent);
});

/**
 * Delete user profile based on IDAM Id
 */
router.post("/deleteuserprofile", (req, res, next) => {
    if (req.body.deleteUser === "Yes") {
        deleteSessionVariables(req);
        deleteUserProfile(req).then((response) => {
            req.session.success = "Successfully deleted the user :- " + req.body.idamId;
            res.redirect(302, "/userprofiles");
        }).catch((error) => {
            req.session.error = {
                status: 400, text: error.rawResponse ? error.rawResponse :
                    "Unexpected error : Please contact your administrator",
            };
            res.redirect(302, `/deleteuserprofile?idamId=${req.body.idamId}`);
        });
    } else if (req.body.deleteUser === "No") {
        deleteSessionVariables(req);
        res.redirect(302, "/userprofiles");
    } else {
        deleteSessionVariables(req);
        req.session.response = { error: "Please choose Yes or No" };
        res.redirect(302, "/deleteuserprofile?idamId=" + req.body.idamId);
    }
});

function deleteSessionVariables(req: any) {
    delete req.session.response;
    delete req.session.error;
    delete req.session.success;
}

export default router;
