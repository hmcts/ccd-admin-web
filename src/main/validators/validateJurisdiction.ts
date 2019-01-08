import { sanitize } from "../util/sanitize";

export function validate(req, res, next) {
  // Jurisdiction is guaranteed to be set from the Jurisdiction Search page, since the dropdown uses jQuery validation
  req.body.jurisdictionName = sanitize(req.body.jurisdictionName);
  req.session.jurisdiction = req.body.jurisdictionName;
  next();
}
