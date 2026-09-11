import { type Locator, type Page } from "@playwright/test";

export class JurisdictionSelectionPage {
  readonly form: Locator;
  readonly jurisdictionSelect: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator("#selectJurisdiction");
    this.jurisdictionSelect = this.form.locator("#jurisdictionName");
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  async selectFirstJurisdiction(): Promise<string> {
    const jurisdiction = await this.jurisdictionSelect.locator('option:not([value=""])').first().getAttribute("value");
    if (!jurisdiction) {
      throw new Error("No jurisdiction is available for the integration test user");
    }
    await this.jurisdictionSelect.selectOption(jurisdiction);
    return jurisdiction;
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
