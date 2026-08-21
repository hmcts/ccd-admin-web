import { type Locator, type Page } from "@playwright/test";

export class DeleteConfirmationPage {
  readonly form: Locator;
  readonly heading: Locator;
  readonly noOption: Locator;
  readonly submitButton: Locator;
  readonly validationError: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator("#confirmdelete");
    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.noOption = this.form.locator("#deleteItem_No");
    this.submitButton = this.form.locator('button[type="submit"]');
    this.validationError = this.form.locator(".error-message");
  }

  async cancelDeletion(): Promise<void> {
    await this.noOption.check();
    await this.submitButton.click();
  }
}
