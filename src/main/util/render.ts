import { fetch } from "../service/get-service";

export function render(req, res, next, url, query, page) {
  fetch(req, url, query).then((response) => {
    res.status(200);
    const responseContent: { [k: string]: any } = {};
    responseContent.adminWebAuthorization = req.adminWebAuthorization;
    responseContent.user = JSON.stringify(req.authentication.user);
    responseContent.currentjurisdiction =
      req.session.jurisdiction ? req.session.jurisdiction : req.body.jurisdictionName;
    responseContent.dataItems = JSON.parse(response);
    if (req.session.error) {
      responseContent.error = req.session.error;
    }
    if (req.session.success) {
      responseContent.success = req.session.success;
      // Clear success message so it doesn't appear subsequently
      delete req.session.success;
    }
    res.render(page, responseContent);
  }).catch((error) => {
    // Call the next middleware, which is the error handler
    next(error);
  });
}
