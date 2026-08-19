import { type Locator, type Page } from "@playwright/test";

export class ImportDefinitionIntegrationPage {
  readonly confirmationCheckbox: Locator;
  readonly fileInput: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly reindexCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    const importForm = page.locator('form[action="/import"]');

    this.confirmationCheckbox = importForm.locator("#confirm");
    this.fileInput = importForm.locator("#file");
    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.navigationLink = page.locator('a[href="/import"]');
    this.reindexCheckbox = importForm.locator("#reindex");
    this.submitButton = importForm.locator('button[type="submit"]');
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
