import { type Locator, type Page } from "@playwright/test";

export class WelshDictionaryPage {
  readonly downloadButton: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly results: Locator;

  constructor(readonly page: Page) {
    this.downloadButton = page.locator("#index-btn");
    this.heading = page.locator("h1.govuk-heading-l");
    this.navigationLink = page.locator('#navigation a[href="/welshDictionary"]');
    this.results = page.locator("#index-result");
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async download(): Promise<void> {
    await this.downloadButton.click();
  }
}
