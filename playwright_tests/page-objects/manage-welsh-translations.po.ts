import { type Locator, type Page } from "@playwright/test";

export class ManageWelshTranslationsPage {
  readonly fileInput: Locator;
  readonly form: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator('form[action="/manageWelshDictionary"]');
    this.fileInput = this.form.locator("#file");
    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.navigationLink = page.locator('a[href="/manageWelshDictionary"]');
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
