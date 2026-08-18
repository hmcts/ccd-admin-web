import { type Locator, type Page } from "@playwright/test";

export class IndexManagementPage {
  readonly elasticsearchLink: Locator;
  readonly globalSearchLink: Locator;
  readonly heading: Locator;
  readonly results: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    const navigation = page.locator("#navigation");

    this.elasticsearchLink = navigation.locator('a[href="/elasticsearch"]');
    this.globalSearchLink = navigation.locator('a[href="/globalsearch"]');
    this.heading = page.locator("h1.govuk-heading-l");
    this.results = page.locator("#index-result");
    this.submitButton = page.locator("#index-btn");
  }

  async openElasticsearch(): Promise<void> {
    await this.elasticsearchLink.click();
  }

  async openGlobalSearch(): Promise<void> {
    await this.globalSearchLink.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
