import { IdamPage } from "@hmcts/playwright-common";
import { expect, test as baseTest } from "@playwright/test";

interface PageFixtures {
  idamPage: IdamPage;
}

export const test = baseTest.extend<PageFixtures>({
  idamPage: async ({ page }, use) => {
    await use(new IdamPage(page));
  },
});

export { expect };
