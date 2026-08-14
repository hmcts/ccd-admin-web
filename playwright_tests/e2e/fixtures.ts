import { IdamPage } from "@hmcts/playwright-common";
import { expect, test as baseTest } from "@playwright/test";
import { AdminWebPage } from "./page-objects/admin-web.po";
import { ImportDefinitionPage } from "./page-objects/import-definition.po";

interface AdminUser {
  username: string;
  password: string;
}

interface PageFixtures {
  adminUser?: AdminUser;
  adminWebPage: AdminWebPage;
  idamPage: IdamPage;
  importDefinitionPage: ImportDefinitionPage;
}

const username = process.env.PLAYWRIGHT_USERNAME;
const password = process.env.PLAYWRIGHT_PASSWORD;
const adminUser = username && password ? { username, password } : undefined;

export const test = baseTest.extend<PageFixtures>({
  adminUser: [adminUser, { option: true }],
  adminWebPage: async ({ page }, use) => {
    await use(new AdminWebPage(page));
  },
  idamPage: async ({ page }, use) => {
    await use(new IdamPage(page));
  },
  importDefinitionPage: async ({ page }, use) => {
    await use(new ImportDefinitionPage(page));
  },
});

export { expect };
