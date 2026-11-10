import { IdamPage } from "@hmcts/playwright-common";
import { type Locator, type Page } from "@playwright/test";

export class IdamLoginPage extends IdamPage {
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.errorAlert = page.getByRole("alert").first();
  }

  async visibleErrorMessage(): Promise<string | undefined> {
    if (!(await this.errorAlert.isVisible())) {
      return undefined;
    }

    return (await this.errorAlert.innerText()).trim();
  }
}
