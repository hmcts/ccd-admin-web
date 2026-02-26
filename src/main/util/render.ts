import { fetch } from "../service/get-service";
import { sanitize } from "../util/sanitize";

export function render(req, res, next, url, query, page) {
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    const bodyJurisdiction = req.body && req.body.jurisdictionName ? req.body.jurisdictionName : "";
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = sanitize(JSON.stringify(req.authentication.user));
    responseContent.currentjurisdiction =
      req.session.jurisdiction ? sanitize(req.session.jurisdiction) : sanitize(bodyJurisdiction);
    responseContent.dataItems = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = JSON.parse(sanitize(JSON.stringify(req.session.error)));
    }
    if (req.session.success) {
      responseContent.success = sanitize(req.session.success);
      // Clear success message so it doesn't appear subsequently
      delete req.session.success;
    }
    res.render(page, responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });
}
