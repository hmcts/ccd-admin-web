const validator = require("validator");
import { Validator } from "../validators/validate";

export function validate(req, res, next, path) {
    const jurisdictionName = new Validator(req.body.currentjurisdiction);
    delete req.session.success;
    if (jurisdictionName.isEmpty()) {
        req.session.error = { status: 401, text: "Please select jurisdiction name" };
        res.redirect(302, "/jurisdiction");
    } else if (!validator.isEmail(req.body.idamId)) {
        req.session.error = { status: 401, text: "Please select a valid email address!" };
        res.redirect(302, path);
    } else {
        delete req.session.error;
        next();
    }
}
