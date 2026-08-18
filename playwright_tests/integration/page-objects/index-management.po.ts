import { type Locator, type Page } from "@playwright/test";

export class IndexManagementPage {
  readonly elasticsearchLink: Locator;
  readonly globalSearchLink: Locator;
  readonly heading: Locator;
  readonly results: Locator;
  readonly submitButton: Locator;

  constructor(readonly page: Page) {
    this.elasticsearchLink = page.getByRole("link", { name: "Create Elasticsearch Indices", exact: true });
    this.globalSearchLink = page.getByRole("link", { name: "Create Global Search Indices", exact: true });
    this.heading = page.getByRole("heading");
    this.results = page.locator("#index-result");
    this.submitButton = page.getByRole("button", { name: "Submit", exact: true });
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
