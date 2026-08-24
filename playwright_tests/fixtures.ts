import { expect, test as baseTest } from "@playwright/test";
import { AdminWebPage } from "./page-objects/admin-web.po";
import { IdamLoginPage } from "./page-objects/idam-login.po";
import { ImportDefinitionPage } from "./page-objects/import-definition.po";

interface PageFixtures {
  adminWebPage: AdminWebPage;
  idamPage: IdamLoginPage;
  importDefinitionPage: ImportDefinitionPage;
}

export const test = baseTest.extend<PageFixtures>({
  adminWebPage: async ({ page }, use) => {
    await use(new AdminWebPage(page));
  },
  idamPage: async ({ page }, use) => {
    await use(new IdamLoginPage(page));
  },
  importDefinitionPage: async ({ page }, use) => {
    await use(new ImportDefinitionPage(page));
  },
});

export { expect };
