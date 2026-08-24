import { type Locator, type Page } from "@playwright/test";

export class UserProfilesPage {
  readonly cancelLink: Locator;
  readonly caseTypeSelect: Locator;
  readonly createLink: Locator;
  readonly form: Locator;
  readonly idamIdInput: Locator;
  readonly idamIdValidationError: Locator;
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
    this.idamIdValidationError = this.form.locator("#idamId-error");
    this.jurisdictionNavigationLink = page.locator('a[href="/jurisdiction?dest=userprofiles"]');
    this.jurisdictionSelect = page.locator("#jurisdictionDropdown");
    this.stateSelect = page.locator("#stateDropdown");
    this.submitButton = this.form.locator('button[type="submit"]');
    this.table = page.locator("table").first();
  }

  async openJurisdictionSelection(): Promise<void> {
    await this.jurisdictionNavigationLink.click();
  }

  async selectFirstCompleteWorkBasket(): Promise<{
    caseType: string;
    jurisdiction: string;
    state: string;
  }> {
    const jurisdictionValues = await this.jurisdictionSelect
      .locator('option:not([value=""])')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));

    let jurisdiction = "";
    for (const value of jurisdictionValues) {
      await this.jurisdictionSelect.selectOption(value);
      if (await this.caseTypeSelect.locator('option:not([value=""])').count()) {
        jurisdiction = value;
        break;
      }
    }
    if (!jurisdiction) {
      throw new Error("No case type is available for the integration-test jurisdictions");
    }

    const caseType = await this.caseTypeSelect.locator('option:not([value=""])').first().getAttribute("value");
    if (!caseType) {
      throw new Error("No case type is available for the selected integration-test jurisdiction");
    }
    await this.caseTypeSelect.selectOption(caseType);

    const state = await this.stateSelect.locator('option:not([value=""])').first().getAttribute("value");
    if (!state) {
      throw new Error("No state is available for the selected integration-test case type");
    }
    await this.stateSelect.selectOption(state);

    return { caseType, jurisdiction, state };
  }
}
