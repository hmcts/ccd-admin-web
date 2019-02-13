import { deleteUserProfile } from "../service/delete-user-service";
import { deleteSessionVariables } from "../util/clearSession";
const router = require("../routes/home");

/**
 * Delete user profile based on IdAM ID
 */
router.post("/deleteuser", (req, res, next) => {
    if (req.body.deleteItem === "Yes") {
        deleteSessionVariables(req);
        deleteUserProfile(req).then((response) => {
            req.session.success = `Successfully deleted the user: ${req.body.idamId}`;
            res.redirect(302, "/userprofiles");
        }).catch((error) => {
            req.session.error = {
                status: 400, text: error.rawResponse ? error.rawResponse :
                    "Unexpected error : Please contact your administrator",
            };
            res.redirect(302, `/deleteitem?item=${req.body.itemToDelete}&idamId=${req.body.idamId}`);
        });
    } else if (req.body.deleteItem === "No") {
        deleteSessionVariables(req);
        res.redirect(302, "/userprofiles");
    } else {
        deleteSessionVariables(req);
        req.session.response = { error: "Please choose Yes or No" };
        res.redirect(302, `/deleteitem?item=${req.body.itemToDelete}&idamId=${req.body.idamId}`);
    }
});

export default router;
