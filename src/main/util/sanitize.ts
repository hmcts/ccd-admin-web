import { inHTMLData } from "xss-filters";

export function sanitize(data) {
    return inHTMLData(data);
}
