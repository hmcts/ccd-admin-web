import { expect, test as baseTest } from "../fixtures";
import { DefinitionsPage } from "../page-objects/definitions.po";
import { DeleteConfirmationPage } from "../page-objects/delete-confirmation.po";
import { IndexManagementPage } from "../page-objects/index-management.po";
import { JurisdictionSelectionPage } from "../page-objects/jurisdiction-selection.po";
import { ManageWelshTranslationsPage } from "../page-objects/manage-welsh-translations.po";
import { ReindexTasksPage } from "../page-objects/reindex-tasks.po";
import { UserProfilesPage } from "../page-objects/user-profiles.po";
import { UserRolesPage } from "../page-objects/user-roles.po";
import { WelshDictionaryPage } from "../page-objects/welsh-dictionary.po";

interface IntegrationPageFixtures {
  definitionsPage: DefinitionsPage;
  deleteConfirmationPage: DeleteConfirmationPage;
  indexManagementPage: IndexManagementPage;
  jurisdictionSelectionPage: JurisdictionSelectionPage;
  manageWelshTranslationsPage: ManageWelshTranslationsPage;
  reindexTasksPage: ReindexTasksPage;
  userProfilesPage: UserProfilesPage;
  userRolesPage: UserRolesPage;
  welshDictionaryPage: WelshDictionaryPage;
}

export const test = baseTest.extend<IntegrationPageFixtures>({
  definitionsPage: async ({ page }, use) => {
    await use(new DefinitionsPage(page));
  },
  deleteConfirmationPage: async ({ page }, use) => {
    await use(new DeleteConfirmationPage(page));
  },
  indexManagementPage: async ({ page }, use) => {
    await use(new IndexManagementPage(page));
  },
  jurisdictionSelectionPage: async ({ page }, use) => {
    await use(new JurisdictionSelectionPage(page));
  },
  manageWelshTranslationsPage: async ({ page }, use) => {
    await use(new ManageWelshTranslationsPage(page));
  },
  reindexTasksPage: async ({ page }, use) => {
    await use(new ReindexTasksPage(page));
  },
  userProfilesPage: async ({ page }, use) => {
    await use(new UserProfilesPage(page));
  },
  userRolesPage: async ({ page }, use) => {
    await use(new UserRolesPage(page));
  },
  welshDictionaryPage: async ({ page }, use) => {
    await use(new WelshDictionaryPage(page));
  },
});

export { expect };
