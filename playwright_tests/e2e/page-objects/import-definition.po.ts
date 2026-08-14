import { type Locator, type Page } from "@playwright/test";

export class ImportDefinitionPage {
  readonly heading: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly noFileSelectedError: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1, name: "Import Case Definition" });
    this.fileInput = page.getByLabel("Choose a file to upload");
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.noFileSelectedError = page.getByText(
      "No file selected! Please select a Definition spreadsheet to import",
      { exact: true },
    );
  }

  async submitWithoutFile(): Promise<void> {
    await this.submitButton.click();
  }
}
