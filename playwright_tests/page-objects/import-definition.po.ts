import { type Locator, type Page } from "@playwright/test";

export class ImportDefinitionPage {
  readonly confirmationCheckbox: Locator;
  readonly heading: Locator;
  readonly fileInput: Locator;
  readonly navigationLink: Locator;
  readonly reindexCheckbox: Locator;
  readonly submitButton: Locator;
  readonly noFileSelectedError: Locator;

  constructor(readonly page: Page) {
    const importForm = page.locator('form[action="/import"]');

    this.confirmationCheckbox = importForm.locator("#confirm");
    this.fileInput = importForm.locator("#file");
    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.navigationLink = page.locator('a[href="/import"]');
    this.noFileSelectedError = importForm.locator("#file-error");
    this.reindexCheckbox = importForm.locator("#reindex");
    this.submitButton = importForm.locator('button[type="submit"]');
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async submitWithoutFile(): Promise<void> {
    await this.submitButton.click();
  }
}
