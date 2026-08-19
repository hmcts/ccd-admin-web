import { type Locator, type Page } from "@playwright/test";

export class UserProfilesPage {
  readonly cancelLink: Locator;
  readonly caseTypeSelect: Locator;
  readonly createLink: Locator;
  readonly form: Locator;
  readonly idamIdInput: Locator;
  readonly jurisdictionNavigationLink: Locator;
  readonly jurisdictionSelect: Locator;
  readonly stateSelect: Locator;
  readonly submitButton: Locator;
  readonly table: Locator;

  constructor(readonly page: Page) {
    this.form = page.locator("#createuserform");
    this.cancelLink = this.form.locator('a[href="/userprofiles"]');
    this.caseTypeSelect = page.locator("#caseTypeDropdown");
    this.createLink = page.locator('a[href="/createuser"]');
    this.idamIdInput = this.form.locator("#idamId");
    this.jurisdictionNavigationLink = page.locator('a[href="/jurisdiction?dest=userprofiles"]');
    this.jurisdictionSelect = page.locator("#jurisdictionDropdown");
    this.stateSelect = page.locator("#stateDropdown");
    this.submitButton = this.form.locator('button[type="submit"]');
    this.table = page.locator("table").first();
  }

  async openJurisdictionSelection(): Promise<void> {
    await this.jurisdictionNavigationLink.click();
  }
}
