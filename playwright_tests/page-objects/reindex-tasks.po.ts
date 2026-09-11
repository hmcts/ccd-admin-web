import { type Locator, type Page } from "@playwright/test";

export class ReindexTasksPage {
  readonly autoRefreshToggle: Locator;
  readonly caseTypeSelect: Locator;
  readonly filterButton: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly pagination: Locator;
  readonly taskTable: Locator;

  constructor(readonly page: Page) {
    const filterForm = page.locator('form[action="/reindex"]');

    this.autoRefreshToggle = page.locator("#autoRefreshToggle");
    this.caseTypeSelect = filterForm.locator("#caseType");
    this.filterButton = filterForm.locator('button[type="submit"]');
    this.heading = page.locator("h1.govuk-heading-l, h2.heading-large");
    this.navigationLink = page.locator('a[href="/reindex"]');
    this.pagination = page.locator("nav.govuk-pagination");
    this.taskTable = page.locator("table").first();
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async selectFirstCaseType(): Promise<string> {
    const caseType = await this.caseTypeSelect.locator('option:not([value=""])').first().getAttribute("value");
    if (!caseType) {
      throw new Error("No reindex case type is available for the integration test user");
    }
    await this.caseTypeSelect.selectOption(caseType);
    return caseType;
  }
}
