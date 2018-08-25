const xssFilters = require("xss-filters");

export function sanitize(data) {
    return xssFilters.inHTMLData(data);
}
