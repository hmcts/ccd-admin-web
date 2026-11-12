type RenderCallback = (error: Error | null, result?: string) => void;

interface NunjucksEnvironment {
  addFilter(
    name: string,
    filter: (value: any, callback: RenderCallback) => void,
    async?: boolean,
  ): void;
  render(templateName: string, context: Record<string, any>, callback: RenderCallback): void;
}

// Error-summary and pagination macros return empty output with express-nunjucks' async loader, so these filters render their templates directly.
export const registerGovukNunjucksFilters = (env: NunjucksEnvironment): void => {
  env.addFilter("govukErrorSummary", (error, callback) => {
    if (!error) {
      callback(null, "");
      return;
    }

    const errorText = error.text || error.message || error.error || error;
    env.render(
      "govuk/components/error-summary/template.njk",
      {
        params: {
          titleText: "There is a problem",
          errorList: [{ text: String(errorText) }],
        },
      },
      callback,
    );
  }, true);

  env.addFilter("govukPagination", (params, callback) => {
    env.render("govuk/components/pagination/template.njk", { params }, callback);
  }, true);
};
