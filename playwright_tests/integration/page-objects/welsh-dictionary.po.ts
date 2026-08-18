import { type Locator, type Page } from "@playwright/test";

export class WelshDictionaryPage {
  readonly downloadButton: Locator;
  readonly heading: Locator;
  readonly navigationLink: Locator;
  readonly results: Locator;

  constructor(readonly page: Page) {
    this.downloadButton = page.getByRole("button", { name: "Download", exact: true });
    this.heading = page.getByRole("heading", { name: "Welsh Dictionary", exact: true });
    this.navigationLink = page.getByRole("link", { name: "Welsh Translations", exact: true });
    this.results = page.locator("#index-result");
  }

  async open(): Promise<void> {
    await this.navigationLink.click();
  }

  async download(): Promise<void> {
    await this.downloadButton.click();
  }
}
