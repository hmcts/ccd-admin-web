import { type Locator, type Page } from "@playwright/test";

export class ImportDefinitionIntegrationPage {
  readonly confirmationCheckbox: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly reindexCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    this.confirmationCheckbox = page.getByRole("checkbox", {
      name: /I confirm that I have consulted with the relevant team/,
    });
    this.heading = page.getByRole("heading", { name: "Import Case Definition", exact: true });
    this.navigationLink = page.getByRole("link", { name: "Import Case Definition", exact: true });
    this.reindexCheckbox = page.getByRole("checkbox", { name: "Perform Reindexing", exact: true });
    this.submitButton = page.getByRole("button", { name: "Submit", exact: true });
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }
}
