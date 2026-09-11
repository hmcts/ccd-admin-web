import { type Locator, type Page } from "@playwright/test";

export class UserRolesPage {
  readonly cancelLink: Locator;
  readonly classificationSelect: Locator;
  readonly createLink: Locator;
  readonly form: Locator;
  readonly navigationLink: Locator;
  readonly roleInput: Locator;
  readonly roleValidationError: Locator;
  readonly submitButton: Locator;
  readonly table: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator("#createuserroleform");
    this.cancelLink = this.form.locator('a[href="/user-roles"]');
    this.classificationSelect = page.locator("#classification");
    this.createLink = page.locator('a[href="/create-user-role-form?save=create"]');
    this.navigationLink = page.locator('a[href="/user-roles"]');
    this.roleInput = this.form.locator("#role");
    this.roleValidationError = this.form.locator("#role-error");
    this.submitButton = this.form.locator('button[type="submit"]');
    this.table = page.locator("table").first();
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }
}
