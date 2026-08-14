import { type Locator, type Page } from "@playwright/test";

export class AdminWebPage {
  readonly heading: Locator;
  readonly importDefinitionLink: Locator;
  readonly logoutButton: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1, name: "Welcome to CCD Admin Web" });
    this.importDefinitionLink = page.getByRole("link", { name: "Import Case Definition" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async openImportDefinition(): Promise<void> {
    await this.importDefinitionLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
