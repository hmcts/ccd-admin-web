const xssFilters = require("xss-filters");

export function sanitize(data) {
    return xssFilters.inHTMLData(data);
}

export const stringifyCircularJSON = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (k, v) => {
    if (v !== null && typeof v === "object") {
      if (seen.has(v)) {
        return;
      }
      seen.add(v);
    }
    return v;
  });
};
