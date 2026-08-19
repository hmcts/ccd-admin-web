import { type Locator, type Page } from "@playwright/test";

export class ImportDefinitionPage {
  readonly heading: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly noFileSelectedError: Locator;

  constructor(readonly page: Page) {
    const importForm = page.locator('form[action="/import"]');

    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.fileInput = importForm.locator("#file");
    this.submitButton = importForm.locator('button[type="submit"]');
    this.noFileSelectedError = importForm.locator("#file-error");
  }

  async submitWithoutFile(): Promise<void> {
    await this.submitButton.click();
  }
}
