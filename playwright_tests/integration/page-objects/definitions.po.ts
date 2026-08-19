import { type Locator, type Page } from "@playwright/test";

export class DefinitionsPage {
  readonly cancelLink: Locator;
  readonly createLink: Locator;
  readonly descriptionInput: Locator;
  readonly descriptionValidationError: Locator;
  readonly form: Locator;
  readonly jurisdictionId: Locator;
  readonly jurisdictionNavigationLink: Locator;
  readonly submitButton: Locator;
  readonly table: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator("#createdefinitionform");
    this.cancelLink = this.form.locator('a[href="/definitions"]');
    this.createLink = page.locator('a[href="/createdefinition"]');
    this.descriptionInput = page.locator("#description");
    this.descriptionValidationError = page.locator("#description-error");
    this.jurisdictionId = page.locator("#jurisdictionId");
    this.jurisdictionNavigationLink = page.locator('a[href="/jurisdiction?dest=definitions"]');
    this.submitButton = this.form.locator('button[type="submit"]');
    this.table = page.locator("table").first();
  }

  async openJurisdictionSelection(): Promise<void> {
    await this.jurisdictionNavigationLink.click();
  }
}
